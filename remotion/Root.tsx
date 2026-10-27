import React from 'react';
import { Composition } from 'remotion';
import {
  EditorialLowerThird,
  PodcastVoiceWave,
  VoxKineticHighlighter,
  StripeMetricBentoCard,
  YoutubeCreatorActionBar,
  MinimalSwissTitleSplit,
  GlassProductCallout,
  SocialQuoteCard,
  BreakingTickerBar,
  ChapterProgressPill,
  VersusComparisonSplit,
  MinimalCornerBug,
  AppleGlassSpeakerCard,
  CorporateGlassLowerThird,
  MinimalCleanTitle,
  KineticBounceHook,
  NeonPodcastOverlay,
  SocialCreatorCallout,
  MetricCounterCard,
  PodcastWaveformPill,
  TEMPLATES_CATALOG,
} from './templates';
import {
  CustomProceduralComposition,
  DEFAULT_PROCEDURAL_LAYERS,
} from './CustomProceduralComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Generative Custom Procedural Composition */}
      <Composition
        id="CustomProceduralComposition"
        component={CustomProceduralComposition}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          sceneTitle: 'Generative Motion Lab',
          backgroundColor: 'transparent',
          layers: DEFAULT_PROCEDURAL_LAYERS,
        }}
      />
      <Composition
        id="custom-procedural"
        component={CustomProceduralComposition}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          sceneTitle: 'Generative Motion Lab',
          backgroundColor: 'transparent',
          layers: DEFAULT_PROCEDURAL_LAYERS,
        }}
      />
      {/* Default SSR Composition Alias */}
      <Composition
        id="MotioneerGraphic"
        component={EditorialLowerThird}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[0].defaultProps}
      />

      {/* 1. Editorial Lower Third */}
      <Composition
        id="EditorialLowerThird"
        component={EditorialLowerThird}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[0].defaultProps}
      />
      <Composition
        id="editorial-lower-third"
        component={EditorialLowerThird}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[0].defaultProps}
      />
      <Composition
        id="AppleGlassSpeakerCard"
        component={AppleGlassSpeakerCard}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[0].defaultProps}
      />
      <Composition
        id="CorporateGlassLowerThird"
        component={CorporateGlassLowerThird}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[0].defaultProps}
      />

      {/* 2. Podcast Voice Wave */}
      <Composition
        id="PodcastVoiceWave"
        component={PodcastVoiceWave}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[1].defaultProps}
      />
      <Composition
        id="podcast-voice-wave"
        component={PodcastVoiceWave}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[1].defaultProps}
      />
      <Composition
        id="PodcastWaveformPill"
        component={PodcastWaveformPill}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[1].defaultProps}
      />
      <Composition
        id="NeonPodcastOverlay"
        component={NeonPodcastOverlay}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[1].defaultProps}
      />

      {/* 3. Vox Kinetic Highlighter */}
      <Composition
        id="VoxKineticHighlighter"
        component={VoxKineticHighlighter}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={TEMPLATES_CATALOG[2].defaultProps}
      />
      <Composition
        id="kinetic-highlighter"
        component={VoxKineticHighlighter}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={TEMPLATES_CATALOG[2].defaultProps}
      />
      <Composition
        id="KineticBounceHook"
        component={KineticBounceHook}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={TEMPLATES_CATALOG[2].defaultProps}
      />

      {/* 4. Stripe KPI Metric Counter */}
      <Composition
        id="StripeMetricBentoCard"
        component={StripeMetricBentoCard}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[3].defaultProps}
      />
      <Composition
        id="kpi-metric-counter"
        component={StripeMetricBentoCard}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[3].defaultProps}
      />
      <Composition
        id="MetricCounterCard"
        component={MetricCounterCard}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[3].defaultProps}
      />

      {/* 5. YouTube Creator CTA Bar */}
      <Composition
        id="YoutubeCreatorActionBar"
        component={YoutubeCreatorActionBar}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[4].defaultProps}
      />
      <Composition
        id="youtube-cta-bar"
        component={YoutubeCreatorActionBar}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[4].defaultProps}
      />
      <Composition
        id="SocialCreatorCallout"
        component={SocialCreatorCallout}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[4].defaultProps}
      />

      {/* 6. Swiss Title Split */}
      <Composition
        id="MinimalSwissTitleSplit"
        component={MinimalSwissTitleSplit}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[5].defaultProps}
      />
      <Composition
        id="swiss-title-split"
        component={MinimalSwissTitleSplit}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[5].defaultProps}
      />
      <Composition
        id="MinimalCleanTitle"
        component={MinimalCleanTitle}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[5].defaultProps}
      />

      {/* 7. Glass Product Callout */}
      <Composition
        id="GlassProductCallout"
        component={GlassProductCallout}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[6].defaultProps}
      />
      <Composition
        id="glass-product-callout"
        component={GlassProductCallout}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[6].defaultProps}
      />

      {/* 8. Social Quote Card */}
      <Composition
        id="SocialQuoteCard"
        component={SocialQuoteCard}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[7].defaultProps}
      />
      <Composition
        id="social-quote-card"
        component={SocialQuoteCard}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[7].defaultProps}
      />

      {/* 9. Breaking Ticker Bar */}
      <Composition
        id="BreakingTickerBar"
        component={BreakingTickerBar}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[8].defaultProps}
      />
      <Composition
        id="breaking-ticker-bar"
        component={BreakingTickerBar}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[8].defaultProps}
      />

      {/* 10. Chapter Progress Pill */}
      <Composition
        id="ChapterProgressPill"
        component={ChapterProgressPill}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[9].defaultProps}
      />
      <Composition
        id="chapter-progress-pill"
        component={ChapterProgressPill}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[9].defaultProps}
      />

      {/* 11. Versus Comparison Split */}
      <Composition
        id="VersusComparisonSplit"
        component={VersusComparisonSplit}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[10].defaultProps}
      />
      <Composition
        id="versus-comparison-split"
        component={VersusComparisonSplit}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[10].defaultProps}
      />

      {/* 12. Minimal Corner Bug */}
      <Composition
        id="MinimalCornerBug"
        component={MinimalCornerBug}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[11].defaultProps}
      />
      <Composition
        id="minimal-corner-bug"
        component={MinimalCornerBug}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={TEMPLATES_CATALOG[11].defaultProps}
      />
    </>
  );
};
