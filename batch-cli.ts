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
      result.batchId = args[i + 1].trim();
      i++;
    } else if (args[i] === '--render-ids' && args[i + 1]) {
      result.renderIds = args[i + 1]
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      i++;
    }
  }

  return result;
}

function resolveCompositionId(templateName?: string, compositionId?: string): string {
  if (
    compositionId &&
    compositionId !== 'default' &&
    compositionId !== 'CustomProceduralComposition'
  ) {
    return compositionId;
  }

  if (!templateName) return 'AppleGlassSpeakerCard';

  const t = templateName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (t.includes('vox') || t.includes('highlighter') || t.includes('kinetic') || t.includes('bounce')) {
    return 'VoxKineticHighlighter';
  }
  if (t.includes('podcast') || t.includes('waveform') || t.includes('voice') || t.includes('neon')) {
    return 'PodcastVoiceWave';
  }
  if (t.includes('stripe') || t.includes('kpi') || t.includes('metric') || t.includes('counter')) {
    return 'StripeMetricBentoCard';
  }
  if (t.includes('youtube') || t.includes('cta') || t.includes('action') || t.includes('socialcreator')) {
    return 'YoutubeCreatorActionBar';
  }
  if (t.includes('swiss') || t.includes('split') || t.includes('clean') || t.includes('title')) {
    return 'MinimalSwissTitleSplit';
  }
  if (t.includes('product') || t.includes('price') || t.includes('glassproduct')) {
    return 'GlassProductCallout';
  }
  if (t.includes('quote') || t.includes('tweet') || t.includes('testimonial')) {
    return 'SocialQuoteCard';
  }
  if (t.includes('ticker') || t.includes('news') || t.includes('breaking')) {
    return 'BreakingTickerBar';
  }
  if (t.includes('chapter') || t.includes('progress') || t.includes('pill')) {
    return 'ChapterProgressPill';
  }
  if (t.includes('versus') || t.includes('comparison') || t.includes('vs')) {
    return 'VersusComparisonSplit';
  }
  if (t.includes('bug') || t.includes('watermark') || t.includes('corner')) {
    return 'MinimalCornerBug';
  }
  if (t.includes('procedural') || t.includes('custom') || t.includes('3d')) {
    return 'CustomProceduralComposition';
  }

  return 'AppleGlassSpeakerCard';
}

async function main() {
  console.log('=====================================================');
  console.log(' Motioneer GitHub Actions Remotion SSR Runner        ');
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
  console.log(`[Batch CLI] Querying render jobs (batchId: ${batchId || 'N/A'}, renderIds count: ${renderIds?.length || 0})`);
  let query = supabase.from('renders').select('*');

  if (renderIds && renderIds.length > 0) {
    query = query.in('id', renderIds);
  } else if (batchId) {
    // Strip sub-batch partitions if present (e.g. batch-1234-part1 -> batch-1234)
    const baseBatchId = batchId.replace(/-part\d+$/, '');
    query = query.contains('metadata', { batchId: baseBatchId });
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

  // 2. Pre-bundle Remotion composition root with alias resolution
  const possiblePaths = [
    path.resolve(process.cwd(), 'remotion/index.ts'),
    path.resolve(process.cwd(), '../remotion/index.ts'),
    path.resolve(__dirname, '../../remotion/index.ts'),
    path.resolve(__dirname, '../remotion/index.ts'),
  ];
  const entryPoint = possiblePaths.find((p) => fs.existsSync(p));

  if (!entryPoint) {
    console.error('[Batch CLI] Remotion entrypoint index.ts not found. Searched:', possiblePaths);
    process.exit(1);
  }

  console.log(`[Batch CLI] Pre-bundling Remotion root from: ${entryPoint}`);
  const bundleStartTime = Date.now();
  const rootDir = path.dirname(path.dirname(entryPoint));

  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (currentConfig) => {
      return {
        ...currentConfig,
        resolve: {
          ...currentConfig.resolve,
          alias: {
            ...(currentConfig.resolve?.alias || {}),
            '@': rootDir,
          },
        },
      };
    },
  });
  console.log(`[Batch CLI] Pre-bundle completed in ${Date.now() - bundleStartTime}ms`);

  // Detect Chrome / Chromium executable
  const chromeExecutable =
    process.env.REMOTION_CHROME_EXECUTABLE ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined) ||
    (fs.existsSync('/usr/bin/chromium-browser') ? '/usr/bin/chromium-browser' : undefined) ||
    (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);

  if (chromeExecutable) {
    console.log(`[Batch CLI] Using Chrome executable: ${chromeExecutable}`);
  }

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
    const format = (meta.format || 'webm').toLowerCase();
    const isWebm = format.includes('webm');
    const fileName = `batch-${batchId || 'cli'}-${job.id}.${isWebm ? 'webm' : 'mp4'}`;
    const tempOutput = path.join(os.tmpdir(), fileName);

    const compositionId = resolveCompositionId(meta.template, meta.compositionId);
    console.log(`[Job ${jobNum}/${jobs.length}] Resolved Composition ID: ${compositionId} (template: ${meta.template || 'N/A'})`);

    try {
      const renderStartTime = Date.now();

      // Extract words for kinetic typography highlighter
      const rawPrompt = (job.prompt || '').trim();
      const words = rawPrompt.split(/\s+/).filter(Boolean);
      const hookWord =
        words.length >= 2
          ? words.slice(-2).join(' ').toUpperCase()
          : (words[0] || 'REVEAL').toUpperCase();
      const midPoint = Math.max(0, words.length - 2);
      const halfMid = Math.ceil(midPoint / 2);
      const phrase1 = words.slice(0, halfMid).join(' ').toUpperCase() || 'DISCOVER THE';
      const phrase2 = words.slice(halfMid, midPoint).join(' ').toUpperCase() || 'NEXT EVOLUTION';

      const clientName = meta.clientName || 'Motioneer Studio';
      const accentColor = meta.accentColor || '#38bdf8';
      const secondaryColor = meta.secondaryColor || '#6366f1';
      const badgeText =
        meta.badgeText || (meta.clientName ? meta.clientName.toUpperCase() : 'VERIFIED AGENCY');

      const inputProps = {
        // Universal Props
        prompt: rawPrompt,
        clientName,
        tier: meta.tier || 'agency',
        accentColor,
        secondaryColor,
        fontFamily: meta.fontFamily || 'Inter',
        canvasBgColor: meta.canvasBgColor || (isWebm ? 'transparent' : '#09090b'),
        backgroundColor: meta.canvasBgColor || (isWebm ? 'transparent' : '#09090b'),
        sfxType: meta.sfxType || 'none',
        isFree: false,

        // Editorial & Speaker Lower Thirds
        primaryText: rawPrompt,
        secondaryText: clientName,
        badgeText,
        name: rawPrompt,
        role: clientName,
        company: clientName,

        // Kinetic Typography Highlighter
        phrase1,
        phrase2,
        hookWord,
        tagline: `🔥 ${clientName.toUpperCase()} • HIGH CONVERTING`,

        // Podcast Waveform
        speakerName: clientName,
        episodeTitle: rawPrompt,

        // YouTube CTA Bar
        channelName: clientName.startsWith('@')
          ? clientName
          : `@${clientName.toLowerCase().replace(/\s+/g, '')}`,
        callToAction: rawPrompt,

        // Swiss Title & Glass Bento
        title: rawPrompt,
        subtitle: clientName,
        badge: badgeText,
        sceneTitle: rawPrompt,
        primaryHeadline: rawPrompt,
        secondarySubtitle: clientName,
        accentBadge: badgeText,

        // Custom Procedural & 3D
        layers: meta.layers || [],
        customCode: meta.customCode,
      };

      const composition = await selectComposition({
        serveUrl,
        id: compositionId,
        inputProps,
      });

      if (!composition) {
        throw new Error(`Composition "${compositionId}" not found in Remotion Root`);
      }

      const aspect = meta.aspectRatio || '16:9';
      let renderWidth = 1920;
      let renderHeight = 1080;

      if (aspect === '9:16') {
        renderWidth = 1080;
        renderHeight = 1920;
      } else if (aspect === '1:1') {
        renderWidth = 1080;
        renderHeight = 1080;
      }

      await renderMedia({
        composition: {
          ...composition,
          width: renderWidth,
          height: renderHeight,
          fps: meta.fps || 60,
          durationInFrames: (meta.fps || 60) * (meta.duration || 4),
        },
        serveUrl,
        codec: isWebm ? 'vp8' : 'h264',
        imageFormat: isWebm ? 'png' : 'jpeg',
        pixelFormat: isWebm ? 'yuva420p' : 'yuv420p',
        outputLocation: tempOutput,
        inputProps,
        browserExecutable: chromeExecutable,
        chromiumOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
          ],
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
