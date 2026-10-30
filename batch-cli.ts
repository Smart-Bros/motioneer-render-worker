import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia, RenderInternals } from '@remotion/renderer';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ----------------------------------------------------------------------------
// 1. ARGUMENT PARSING
// ----------------------------------------------------------------------------
function parseArgs(): { batchId?: string; renderIds?: string[] } {
  const args = process.argv.slice(2);
  let batchId: string | undefined;
  let renderIds: string[] | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch-id' && args[i + 1]) {
      batchId = args[i + 1].trim();
      i++;
    } else if (args[i] === '--render-ids' && args[i + 1]) {
      renderIds = args[i + 1]
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      i++;
    }
  }

  return { batchId, renderIds };
}

// ----------------------------------------------------------------------------
// 2. TEMPLATE / COMPOSITION RESOLUTION
// ----------------------------------------------------------------------------
function resolveCompositionId(templateName?: string, fallbackId?: string): string {
  if (fallbackId && fallbackId !== 'CustomProceduralComposition') {
    return fallbackId;
  }
  if (!templateName) return 'CustomProceduralComposition';

  const t = templateName.toLowerCase();
  if (t.includes('editorial') || t.includes('lower third') || t.includes('speaker')) {
    return 'EditorialLowerThird';
  }
  if (t.includes('podcast') || t.includes('voice') || t.includes('audio') || t.includes('waveform')) {
    return 'PodcastVoiceWave';
  }
  if (t.includes('vox') || t.includes('kinetic') || t.includes('highlight') || t.includes('bounce')) {
    return 'VoxKineticHighlighter';
  }
  if (t.includes('stripe') || t.includes('metric') || t.includes('bento') || t.includes('kpi') || t.includes('counter')) {
    return 'StripeMetricBentoCard';
  }
  if (t.includes('youtube') || t.includes('cta') || t.includes('creator') || t.includes('action')) {
    return 'YoutubeCreatorActionBar';
  }
  if (t.includes('swiss') || t.includes('title') || t.includes('minimal')) {
    return 'MinimalSwissTitleSplit';
  }
  if (t.includes('product') || t.includes('callout') || t.includes('feature')) {
    return 'GlassProductCallout';
  }
  if (t.includes('quote') || t.includes('social') || t.includes('card')) {
    return 'SocialQuoteCard';
  }
  if (t.includes('ticker') || t.includes('breaking') || t.includes('news')) {
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

// ----------------------------------------------------------------------------
// 3. FAST CHROME DETECTOR (Uses Pre-Installed Google Chrome on Ubuntu)
// ----------------------------------------------------------------------------
function getSystemChrome(): string | undefined {
  const candidates = [
    process.env.REMOTION_CHROME_EXECUTABLE,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROMIUM_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ].filter(Boolean);

  for (const c of candidates) {
    if (c && fs.existsSync(c)) {
      return c;
    }
  }
  return undefined;
}

// ----------------------------------------------------------------------------
// 4. PERSISTENT CACHED BUNDLE (Skips bundling on cache hits)
// ----------------------------------------------------------------------------
async function getOrBuildBundle(): Promise<string> {
  // Check if /tmp/remotion-bundle exists (restored from GitHub Actions cache)
  const bundleCacheDir = process.env.REMOTION_BUNDLE_CACHE_DIR || path.join(os.tmpdir(), 'remotion-bundle');
  const bundleIndexPath = path.join(bundleCacheDir, 'index.html');
  const bundleJsPath = path.join(bundleCacheDir, 'bundle.js');

  if (fs.existsSync(bundleIndexPath) || fs.existsSync(bundleJsPath)) {
    console.log(`[Motioneer Render Engine] Using pre-cached Remotion bundle from: ${bundleCacheDir}`);
    return bundleCacheDir;
  }

  // Check persistent location text file
  const cacheFile = path.join(os.tmpdir(), 'motioneer-remotion-bundle-location.txt');
  if (fs.existsSync(cacheFile)) {
    try {
      const cached = fs.readFileSync(cacheFile, 'utf-8').trim();
      if (cached && fs.existsSync(cached)) {
        console.log(`[Motioneer Render Engine] Using warm bundle from: ${cached}`);
        return cached;
      }
    } catch {
      // rebuild
    }
  }

  const possiblePaths = [
    path.resolve(process.cwd(), 'remotion/index.ts'),
    path.resolve(process.cwd(), 'remotion/index.tsx'),
    path.resolve(__dirname, 'remotion/index.ts'),
    path.resolve(__dirname, 'remotion/index.tsx'),
    path.resolve(__dirname, '../remotion/index.ts'),
    path.resolve(__dirname, '../remotion/index.tsx'),
    path.resolve(process.cwd(), '../remotion/index.ts'),
  ];
  const entryPoint = possiblePaths.find((p) => fs.existsSync(p));

  if (!entryPoint) {
    throw new Error(`Remotion entrypoint index.ts not found. Searched: ${possiblePaths.join(', ')}`);
  }

  console.log(`[Motioneer Render Engine] Pre-bundling Remotion root from: ${entryPoint}`);
  const bundleStartTime = Date.now();
  const rootDir = path.dirname(path.dirname(entryPoint));

  const bundleLocation = await bundle({
    entryPoint,
    outDir: bundleCacheDir,
    webpackOverride: (currentConfig) => ({
      ...currentConfig,
      resolve: {
        ...currentConfig.resolve,
        modules: [
          path.resolve(rootDir, 'node_modules'),
          path.resolve(process.cwd(), 'node_modules'),
          path.resolve(__dirname, 'node_modules'),
          ...(currentConfig.resolve?.modules || ['node_modules']),
        ],
        alias: {
          ...(currentConfig.resolve?.alias || {}),
          '@': rootDir,
        },
      },
    }),
  });

  try {
    fs.writeFileSync(cacheFile, bundleLocation, 'utf-8');
  } catch {
    // non-fatal
  }

  console.log(`[Motioneer Render Engine] Pre-bundle completed in ${Date.now() - bundleStartTime}ms: ${bundleLocation}`);
  return bundleLocation;
}

// ----------------------------------------------------------------------------
// 5. DETERMINISTIC REAL TELEMETRY PROGRESS UPDATER
// ----------------------------------------------------------------------------
const lastProgressUpdateMap = new Map<string, number>();

async function updateRenderProgress(
  supabase: any,
  renderId: string,
  data: {
    stage: 'queued' | 'initializing' | 'rendering' | 'uploading' | 'completed' | 'failed';
    progress: number;
    renderedFrames?: number;
    totalFrames?: number;
    stageText: string;
    videoUrl?: string;
    force?: boolean;
    metadata?: Record<string, any>;
  }
) {
  const now = Date.now();
  const lastTime = lastProgressUpdateMap.get(renderId) || 0;

  // Throttle non-final updates to once every 500ms
  if (!data.force && data.stage === 'rendering' && now - lastTime < 500) {
    return;
  }
  lastProgressUpdateMap.set(renderId, now);

  const dbStatus =
    data.stage === 'completed'
      ? 'success'
      : data.stage === 'failed'
      ? 'failed'
      : 'pending';

  const updatePayload: Record<string, any> = {
    status: dbStatus,
  };

  if (data.videoUrl) {
    updatePayload.video_url = data.videoUrl;
  }

  // Fetch current metadata to merge
  let currentMeta: Record<string, any> = {};
  try {
    const { data: row } = await supabase
      .from('renders')
      .select('metadata')
      .eq('id', renderId)
      .maybeSingle();
    currentMeta = row?.metadata || {};
  } catch {
    // ignore
  }

  const mergedMeta = {
    ...currentMeta,
    ...(data.metadata || {}),
    stage: data.stage,
    progress: data.progress,
    stage_text: data.stageText,
    rendered_frames: data.renderedFrames ?? currentMeta.rendered_frames ?? 0,
    total_frames: data.totalFrames ?? currentMeta.total_frames ?? 0,
    renderEngine: 'motioneer-render-engine',
    last_updated: new Date().toISOString(),
  };
  updatePayload.metadata = mergedMeta;

  try {
    const { error: updateErr } = await supabase
      .from('renders')
      .update(updatePayload)
      .eq('id', renderId);

    if (updateErr) {
      console.error(`[Motioneer Render Engine] Error updating render progress for ${renderId}:`, updateErr);
    } else if (data.stage === 'completed') {
      console.log(`[Motioneer Render Engine] Successfully updated DB for ${renderId} (status: success, video_url: ${data.videoUrl})`);
    }
  } catch (err) {
    console.error(`[Motioneer Render Engine] Exception updating render progress for ${renderId}:`, err);
  }
}

// ----------------------------------------------------------------------------
// 6. PROCESS A SINGLE RENDER JOB
// ----------------------------------------------------------------------------
async function processRenderJob(
  supabase: any,
  job: any,
  serveUrl: string,
  chromeExecutable: string | undefined,
  concurrencySetting: number | string
): Promise<boolean> {
  const meta = job.metadata || {};
  const renderStartTime = Date.now();

  console.log(`\n[Motioneer Render Engine] Processing Job ID: ${job.id}`);
  console.log(`Prompt: "${job.prompt}"`);

  // Stage 1: Initializing (5%)
  await updateRenderProgress(supabase, job.id, {
    stage: 'initializing',
    progress: 5,
    stageText: 'Allocating Render Node',
    force: true,
  });

  const format = (meta.format || 'mp4').toLowerCase();
  const isWebm = format.includes('webm');
  const fileName = `motioneer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${isWebm ? 'webm' : 'mp4'}`;
  const tempOutput = path.join(os.tmpdir(), fileName);

  const compositionId = resolveCompositionId(meta.template || meta.templateId || meta.compositionId, meta.compositionId);

  try {
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
    const accentColor = meta.accentColor || meta.primaryColor || '#38bdf8';
    const secondaryColor = meta.secondaryColor || '#6366f1';
    const badgeText = meta.badgeText || (meta.clientName ? meta.clientName.toUpperCase() : 'VERIFIED AGENCY');

    const inputProps = {
      // Universal Props
      prompt: rawPrompt,
      clientName,
      tier: meta.tier || 'agency',
      accentColor,
      secondaryColor,
      primaryColor: accentColor,
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
      tsxCode: meta.customCode || meta.tsxCode,
    };

    // Stage 2: Compiling Composition
    await updateRenderProgress(supabase, job.id, {
      stage: 'initializing',
      progress: 8,
      stageText: 'Compiling Composition',
      force: true,
    });

    const composition = await selectComposition({
      serveUrl,
      id: compositionId,
      inputProps,
      browserExecutable: chromeExecutable,
    });

    if (!composition) {
      throw new Error(`Composition "${compositionId}" not found in Remotion Root`);
    }

    const aspect = meta.aspectRatio || '16:9';
    const is4K = meta.resolution === '4K';
    let renderWidth = is4K ? 3840 : 1920;
    let renderHeight = is4K ? 2160 : 1080;

    if (aspect === '9:16') {
      renderWidth = is4K ? 2160 : 1080;
      renderHeight = is4K ? 3840 : 1920;
    } else if (aspect === '1:1') {
      renderWidth = is4K ? 2160 : 1080;
      renderHeight = is4K ? 2160 : 1080;
    }

    const targetFps = Number(meta.fps || 30);
    const targetDurationFrames = Math.max(30, Math.round(targetFps * Number(meta.duration || 3)));

    console.log(`[Motioneer Render Engine] Rendering ${renderWidth}x${renderHeight} @ ${targetFps}fps (${targetDurationFrames} frames) with concurrency ${concurrencySetting}...`);

    // Stage 3: Rendering Frames with Deterministic Progress Callback
    await renderMedia({
      composition: {
        ...composition,
        width: renderWidth,
        height: renderHeight,
        fps: targetFps,
        durationInFrames: targetDurationFrames,
      },
      serveUrl,
      codec: isWebm ? 'vp8' : 'h264',
      imageFormat: isWebm ? 'png' : 'jpeg',
      pixelFormat: isWebm ? 'yuva420p' : 'yuv420p',
      outputLocation: tempOutput,
      inputProps,
      browserExecutable: chromeExecutable,
      concurrency: concurrencySetting,
      offthreadVideoCacheSizeInBytes: 512 * 1024 * 1024,
      chromiumOptions: {
        gl: 'angle',
        disableWebSecurity: true,
        enableMultiProcessOnLinux: true,
        headless: true,
      },
      timeoutInMilliseconds: 240000,
      logLevel: 'warn',
      onProgress: ({ renderedFrames, progress }) => {
        const actualPercent = Math.min(92, Math.max(10, Math.round(progress * 100)));
        updateRenderProgress(supabase, job.id, {
          stage: 'rendering',
          progress: actualPercent,
          renderedFrames,
          totalFrames: targetDurationFrames,
          stageText: `Rendering Frame ${renderedFrames} of ${targetDurationFrames} (${actualPercent}%)`,
        }).catch(() => {});
      },
    });

    // Stage 4: Uploading Master Asset (95%)
    await updateRenderProgress(supabase, job.id, {
      stage: 'uploading',
      progress: 95,
      renderedFrames: targetDurationFrames,
      totalFrames: targetDurationFrames,
      stageText: 'Finalizing Master Asset',
      force: true,
    });

    const videoBuffer = await fs.promises.readFile(tempOutput);
    console.log(`[Motioneer Render Engine] Rendered ${videoBuffer.length} bytes in ${Date.now() - renderStartTime}ms. Uploading to storage...`);

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

    const publicUrl = urlData.publicUrl;

    // Stage 5: Render Complete (100%)
    await updateRenderProgress(supabase, job.id, {
      stage: 'completed',
      progress: 100,
      renderedFrames: targetDurationFrames,
      totalFrames: targetDurationFrames,
      stageText: 'Render Complete',
      videoUrl: publicUrl,
      force: true,
      metadata: {
        sizeBytes: videoBuffer.length,
        durationMs: Date.now() - renderStartTime,
        renderEngine: 'motioneer-render-engine',
      },
    });

    console.log(`[Motioneer Render Engine] Job ${job.id} completed successfully! URL: ${publicUrl}`);
    return true;
  } catch (err: any) {
    console.error(`[Motioneer Render Engine] Job ${job.id} failed:`, err);
    await updateRenderProgress(supabase, job.id, {
      stage: 'failed',
      progress: 0,
      stageText: err?.message || 'Render failed during video generation',
      force: true,
      metadata: {
        error: err instanceof Error ? err.message : String(err),
      },
    });
    return false;
  } finally {
    if (fs.existsSync(tempOutput)) {
      await fs.promises.unlink(tempOutput).catch(() => {});
    }
  }
}

// ----------------------------------------------------------------------------
// 7. HEARTBEAT MANAGEMENT FOR 10-MINUTE WARM CLUSTER RUNNER
// ----------------------------------------------------------------------------
const HEARTBEAT_ID = '00000000-0000-0000-0000-000000000000';

async function sendHeartbeat(supabase: any) {
  try {
    await supabase.from('renders').upsert({
      id: HEARTBEAT_ID,
      user_id: '27cb3a99-9300-4f30-9ce2-7c1be05cdfaa',
      prompt: 'MOTIONEER_CLUSTER_HEARTBEAT',
      status: 'pending',
      metadata: {
        heartbeat: Date.now(),
        runner: 'warm-cluster-worker',
        stage: 'warm',
        pid: process.pid,
      },
    });
  } catch {
    // non-fatal
  }
}

async function clearHeartbeat(supabase: any) {
  try {
    await supabase.from('renders').delete().eq('id', HEARTBEAT_ID);
  } catch {
    // non-fatal
  }
}

// ----------------------------------------------------------------------------
// 8. MAIN ENTRYPOINT & 10-MINUTE WARM QUEUE WORKER LOOP
// ----------------------------------------------------------------------------
async function main() {
  console.log('=====================================================');
  console.log(' Motioneer Render Engine Worker                      ');
  console.log('=====================================================');

  const { batchId, renderIds } = parseArgs();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const chromeExecutable = getSystemChrome();
  const safeConcurrency = RenderInternals?.getMaxConcurrency ? RenderInternals.getMaxConcurrency() : '100%';

  if (chromeExecutable) {
    console.log(`[Motioneer Render Engine] Detected system Chrome: ${chromeExecutable}`);
  } else {
    console.log('[Motioneer Render Engine] System Chrome not found, relying on Remotion Chrome executable');
  }

  // Pre-bundle or retrieve warm bundle
  const serveUrl = await getOrBuildBundle();

  // Clean exit handlers
  process.on('SIGTERM', async () => {
    console.log('\n[Motioneer Render Engine] Received SIGTERM, cleaning up heartbeat...');
    await clearHeartbeat(supabase);
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    console.log('\n[Motioneer Render Engine] Received SIGINT, cleaning up heartbeat...');
    await clearHeartbeat(supabase);
    process.exit(0);
  });

  // Track processed jobs to guarantee no duplicate execution within this worker process
  const processedJobIds = new Set<string>();

  // Step A: Process initially requested jobs (if any)
  let initialJobs: any[] = [];
  if (renderIds && renderIds.length > 0) {
    const { data } = await supabase.from('renders').select('*').in('id', renderIds);
    initialJobs = data || [];
  } else if (batchId) {
    const baseBatchId = batchId.replace(/-part\d+$/, '');
    const { data } = await supabase
      .from('renders')
      .select('*')
      .contains('metadata', { batchId: baseBatchId });
    initialJobs = data || [];
  }

  if (initialJobs.length > 0) {
    console.log(`[Motioneer Render Engine] Found ${initialJobs.length} initial render jobs to process.`);
    for (const job of initialJobs) {
      // Check if job was already completed by Hugging Face while GitHub runner was booting up
      const { data: latestJob } = await supabase
        .from('renders')
        .select('status, video_url')
        .eq('id', job.id)
        .maybeSingle();

      if (latestJob?.status === 'success' && latestJob?.video_url) {
        console.log(`[Motioneer Render Engine] Job ${job.id} was already completed by primary worker (${latestJob.video_url}). Skipping.`);
        processedJobIds.add(job.id);
        continue;
      }

      processedJobIds.add(job.id);
      await processRenderJob(supabase, job, serveUrl, chromeExecutable, safeConcurrency);
    }
  }

  // Step B: Enter the 10-Minute (600s) Warm Queue Worker Loop
  console.log('\n=====================================================');
  console.log(' Entering 10-Minute Warm Worker Loop (Idle Timeout: 600s) ');
  console.log(' Waiting for consecutive render jobs with zero boot overhead...');
  console.log('=====================================================');

  const IDLE_TIMEOUT_MS = 600 * 1000; // 10 minutes
  let lastJobFinishedTime = Date.now();
  let lastHeartbeatTime = 0;

  while (Date.now() - lastJobFinishedTime < IDLE_TIMEOUT_MS) {
    // Maintain runner heartbeat every 5 seconds
    if (Date.now() - lastHeartbeatTime > 5000) {
      await sendHeartbeat(supabase);
      lastHeartbeatTime = Date.now();
    }

    // Query for any queued or pending renders
    try {
      const { data: pendingJobs } = await supabase
        .from('renders')
        .select('*')
        .in('status', ['pending', 'queued'])
        .is('video_url', null)
        .neq('id', HEARTBEAT_ID)
        .order('created_at', { ascending: true })
        .limit(3);

      if (pendingJobs && pendingJobs.length > 0) {
        for (const job of pendingJobs) {
          // Skip if already processed in this session or already has video
          if (processedJobIds.has(job.id) || job.video_url || job.status === 'success') {
            continue;
          }

          // Verify job is not claimed by another process
          if (job.metadata?.stage === 'rendering' && Date.now() - new Date(job.metadata?.last_updated || job.created_at).getTime() < 30000) {
            continue;
          }

          processedJobIds.add(job.id);
          console.log(`[Warm Worker Loop] Instant pickup for pending render ID: ${job.id}`);
          await processRenderJob(supabase, job, serveUrl, chromeExecutable, safeConcurrency);
          lastJobFinishedTime = Date.now();
        }
      }
    } catch (pollErr) {
      console.warn('[Warm Worker Loop] Poll notice:', pollErr);
    }

    // Sleep 1500ms between polls
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log('\n[Motioneer Render Engine] 10-minute idle timeout reached with no incoming jobs. Shutting down worker gracefully.');
  await clearHeartbeat(supabase);
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[Motioneer Render Engine] Fatal error:', err);
  process.exit(1);
});
