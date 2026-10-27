import path from 'path';
import fs from 'fs';
import os from 'os';
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
} catch {
  // env vars in process.env
}
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createClient } from '@supabase/supabase-js';

interface CommandLineArgs {
  batchId?: string;
  renderIds?: string[];
}

function parseArgs(): CommandLineArgs {
  const args = process.argv.slice(2);
  const result: CommandLineArgs = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch-id' && args[i + 1]) {
      result.batchId = args[i + 1];
      i++;
    } else if (args[i] === '--render-ids' && args[i + 1]) {
      result.renderIds = args[i + 1].split(',').map((id) => id.trim()).filter(Boolean);
      i++;
    }
  }

  return result;
}

async function main() {
  console.log('=====================================================');
  console.log(' Motioneer GitHub Actions Free Render Runner ');
  console.log('=====================================================');

  const { batchId, renderIds } = parseArgs();

  if (!batchId && (!renderIds || renderIds.length === 0)) {
    console.error('Error: Please provide either --batch-id <id> or --render-ids <id1,id2>');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch pending render records
  console.log(`[Batch CLI] Querying render jobs for batch: ${batchId || 'by IDs'}`);
  let query = supabase.from('renders').select('*');

  if (batchId) {
    query = query.contains('metadata', { batchId });
  } else if (renderIds && renderIds.length > 0) {
    query = query.in('id', renderIds);
  }

  const { data: jobs, error: fetchErr } = await query;

  if (fetchErr) {
    console.error('[Batch CLI] Failed to query renders:', fetchErr);
    process.exit(1);
  }

  if (!jobs || jobs.length === 0) {
    console.log('[Batch CLI] No matching pending render jobs found. Exiting.');
    process.exit(0);
  }

  console.log(`[Batch CLI] Found ${jobs.length} render jobs to process.`);

  // 2. Pre-bundle Remotion composition once
  const possiblePaths = [
    path.resolve(process.cwd(), 'remotion/index.ts'),
    path.resolve(process.cwd(), '../remotion/index.ts'),
    path.resolve(__dirname, '../../remotion/index.ts'),
  ];
  const entryPoint = possiblePaths.find((p) => fs.existsSync(p));

  if (!entryPoint) {
    console.error('[Batch CLI] Remotion entrypoint index.ts not found.');
    process.exit(1);
  }

  console.log(`[Batch CLI] Pre-bundling Remotion root from: ${entryPoint}`);
  const bundleStartTime = Date.now();
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });
  console.log(`[Batch CLI] Pre-bundle completed in ${Date.now() - bundleStartTime}ms`);

  // 3. Process each render job
  let successCount = 0;
  let failCount = 0;

  for (let idx = 0; idx < jobs.length; idx++) {
    const job = jobs[idx];
    const jobNum = idx + 1;
    console.log(`\n-----------------------------------------------------`);
    console.log(`[Job ${jobNum}/${jobs.length}] Starting render ID: ${job.id}`);
    console.log(`Prompt: "${job.prompt}"`);

    // Mark status 'rendering'
    await supabase.from('renders').update({ status: 'rendering' }).eq('id', job.id);

    const meta = job.metadata || {};
    const format = meta.format || 'webm';
    const isWebm = format.includes('webm');
    const fileName = `batch-${batchId || 'cli'}-${job.id}.${isWebm ? 'webm' : 'mp4'}`;
    const tempOutput = path.join(os.tmpdir(), fileName);

    try {
      const renderStartTime = Date.now();
      const inputProps = {
        prompt: job.prompt,
        sceneTitle: meta.sceneTitle || job.prompt,
        primaryHeadline: job.prompt || meta.sceneTitle,
        clientName: meta.clientName || 'Motioneer Studio',
        tier: meta.tier || 'agency',
        primaryColor: meta.primaryColor || '#0f172a',
        secondaryColor: meta.secondaryColor || '#38bdf8',
        layers: meta.layers || [],
        customCode: meta.customCode,
        sfxType: meta.sfxType || 'none',
        backgroundColor: meta.canvasBgColor || '#09090b',
        aspectRatio: meta.aspectRatio || '16:9',
      };

      const composition = await selectComposition({
        serveUrl,
        id: meta.compositionId || 'CustomProceduralComposition',
        inputProps,
      });

      if (!composition) {
        throw new Error(`Composition not found for job ${job.id}`);
      }

      await renderMedia({
        composition: {
          ...composition,
          width: meta.resolution === '4K' ? 3840 : 1920,
          height: meta.resolution === '4K' ? 2160 : 1080,
          fps: meta.fps || 60,
          durationInFrames: (meta.fps || 60) * (meta.duration || 3),
        },
        serveUrl,
        codec: isWebm ? 'vp8' : 'h264',
        imageFormat: isWebm ? 'png' : 'jpeg',
        pixelFormat: isWebm ? 'yuva420p' : 'yuv420p',
        outputLocation: tempOutput,
        inputProps,
        browserExecutable:
          process.env.REMOTION_CHROME_EXECUTABLE ||
          process.env.PUPPETEER_EXECUTABLE_PATH ||
          null,
        chromiumOptions: {
          gl: 'angle',
        },
        timeoutInMilliseconds: 180000,
        logLevel: 'warn',
      });

      const videoBuffer = await fs.promises.readFile(tempOutput);
      console.log(
        `[Job ${jobNum}/${jobs.length}] Rendered ${videoBuffer.length} bytes in ${
          Date.now() - renderStartTime
        }ms. Uploading to Supabase Storage...`
      );

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('motioneer-renders')
        .upload(fileName, videoBuffer, {
          contentType: isWebm ? 'video/webm' : 'video/mp4',
          upsert: true,
        });

      if (uploadErr) {
        throw uploadErr;
      }

      const { data: urlData } = supabase.storage
        .from('motioneer-renders')
        .getPublicUrl(fileName);

      // Update row in renders table
      await supabase
        .from('renders')
        .update({
          status: 'success',
          video_url: urlData.publicUrl,
          metadata: {
            ...meta,
            renderEngine: 'github-actions-free-runner',
            sizeBytes: videoBuffer.length,
            durationMs: Date.now() - renderStartTime,
          },
        })
        .eq('id', job.id);

      console.log(`[Job ${jobNum}/${jobs.length}] Success! Public URL: ${urlData.publicUrl}`);
      successCount++;
    } catch (jobErr) {
      console.error(`[Job ${jobNum}/${jobs.length}] Render failed:`, jobErr);
      await supabase
        .from('renders')
        .update({
          status: 'failed',
          metadata: {
            ...meta,
            error: jobErr instanceof Error ? jobErr.message : 'Render failed',
          },
        })
        .eq('id', job.id);
      failCount++;
    } finally {
      if (fs.existsSync(tempOutput)) {
        await fs.promises.unlink(tempOutput).catch(() => {});
      }
    }
  }

  console.log('\n=====================================================');
  console.log(`Batch Summary: Total: ${jobs.length} | Success: ${successCount} | Failed: ${failCount}`);
  console.log('=====================================================');
}

main().catch((err) => {
  console.error('[Batch CLI] Fatal script failure:', err);
  process.exit(1);
});
