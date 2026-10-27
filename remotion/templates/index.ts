import React from 'react';
import { EditorialLowerThird, EditorialLowerThirdProps } from './EditorialLowerThird';
import { PodcastVoiceWave, PodcastVoiceWaveProps } from './PodcastVoiceWave';
import { VoxKineticHighlighter, VoxKineticHighlighterProps } from './VoxKineticHighlighter';
import { StripeMetricBentoCard, StripeMetricBentoCardProps } from './StripeMetricBentoCard';
import { YoutubeCreatorActionBar, YoutubeCreatorActionBarProps } from './YoutubeCreatorActionBar';
import { MinimalSwissTitleSplit, MinimalSwissTitleSplitProps } from './MinimalSwissTitleSplit';
import { GlassProductCallout, GlassProductCalloutProps } from './GlassProductCallout';
import { SocialQuoteCard, SocialQuoteCardProps } from './SocialQuoteCard';
import { BreakingTickerBar, BreakingTickerBarProps } from './BreakingTickerBar';
import { ChapterProgressPill, ChapterProgressPillProps } from './ChapterProgressPill';
import { VersusComparisonSplit, VersusComparisonSplitProps } from './VersusComparisonSplit';
import { MinimalCornerBug, MinimalCornerBugProps } from './MinimalCornerBug';

// Legacy Aliases
import { AppleGlassSpeakerCard } from './AppleGlassSpeakerCard';
import { CorporateGlassLowerThird } from './CorporateGlassLowerThird';
import { MinimalCleanTitle } from './MinimalCleanTitle';
import { KineticBounceHook } from './KineticBounceHook';
import { NeonPodcastOverlay } from './NeonPodcastOverlay';
import { SocialCreatorCallout } from './SocialCreatorCallout';
import { MetricCounterCard } from './MetricCounterCard';
import { PodcastWaveformPill } from './PodcastWaveformPill';

import { UserTier } from '@/lib/supabase/types';

export {
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
  // Legacy
  AppleGlassSpeakerCard,
  CorporateGlassLowerThird,
  MinimalCleanTitle,
  KineticBounceHook,
  NeonPodcastOverlay,
  SocialCreatorCallout,
  MetricCounterCard,
  PodcastWaveformPill,
};

export type {
  EditorialLowerThirdProps,
  PodcastVoiceWaveProps,
  VoxKineticHighlighterProps,
  StripeMetricBentoCardProps,
  YoutubeCreatorActionBarProps,
  MinimalSwissTitleSplitProps,
  GlassProductCalloutProps,
  SocialQuoteCardProps,
  BreakingTickerBarProps,
  ChapterProgressPillProps,
  VersusComparisonSplitProps,
  MinimalCornerBugProps,
};

export type TemplateCategory =
  | 'All'
  | 'Viral Hook'
  | 'Broadcast Lower Third'
  | 'SaaS UI Callout'
  | 'Creator CTA'
  | 'Data KPI';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  tier: UserTier;
  category: TemplateCategory;
  component: React.FC<any>;
  defaultProps: Record<string, any>;
  aspectRatios: Array<'16:9' | '9:16' | '1:1'>;
  accentColor: string;
}

export const TEMPLATES_CATALOG: TemplateMetadata[] = [
  {
    id: 'editorial-lower-third',
    name: 'Editorial Lower Third',
    description:
      'Sharp architectural two-tone bar (Bloomberg / Verge style) with crisp wipe-in accent block, bold geometric name, and uppercase role badge.',
    tier: 'free',
    category: 'Broadcast Lower Third',
    component: EditorialLowerThird,
    defaultProps: {
      primaryText: 'Alexander Vance',
      secondaryText: 'Senior Technology Correspondent',
      badgeText: 'BLOOMBERG VERGE',
      accentColor: '#38bdf8',
      secondaryColor: '#6366f1',
      fontFamily: 'Inter',
      position: 'bottom-left',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#38bdf8',
  },
  {
    id: 'podcast-voice-wave',
    name: 'Podcast Voice Wave',
    description:
      'Clean audio wave speaker card with matte frosted pill, 24-bar reactive SVG waveform, speaker initials ring, and custom gradient accents.',
    tier: 'free',
    category: 'SaaS UI Callout',
    component: PodcastVoiceWave,
    defaultProps: {
      primaryText: 'Nimit Biswas',
      secondaryText: 'Founder, Smart Bros',
      badgeText: 'EPISODE 01',
      accentColor: '#EC4899',
      secondaryColor: '#F43F5E',
      fontFamily: 'Inter',
      position: 'center',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#EC4899',
  },
  {
    id: 'kinetic-highlighter',
    name: 'Vox Kinetic Highlighter',
    description:
      'High-retention word-by-word kinetic hook where the key power phrase receives an angled marker stroke sweep with paper shadow depth.',
    tier: 'free',
    category: 'Viral Hook',
    component: VoxKineticHighlighter,
    defaultProps: {
      phrase1: 'STOP OPENING',
      phrase2: 'AFTER EFFECTS FOR',
      hookWord: 'SIMPLE GRAPHICS',
      tagline: '10X FASTER WORKFLOW',
      primaryColor: '#f43f5e',
      accentColor: '#facc15',
      fontFamily: 'Plus Jakarta Sans',
      position: 'Center Stage',
      isFree: false,
    },
    aspectRatios: ['9:16', '16:9', '1:1'],
    accentColor: '#f43f5e',
  },
  {
    id: 'kpi-metric-counter',
    name: 'Stripe KPI Metric Counter',
    description:
      'Financial & SaaS metric counter with animated tabular numbers (0 -> target), smooth evolving SVG sparkline trend graph, and percentage pill.',
    tier: 'free',
    category: 'Data KPI',
    component: StripeMetricBentoCard,
    defaultProps: {
      label: 'Conversion Velocity',
      targetValue: 384,
      prefix: '+',
      suffix: '%',
      trendText: '+48.2% vs Previous Quarter',
      isPositive: true,
      primaryColor: '#10b981',
      accentColor: '#3b82f6',
      fontFamily: 'Cabinet Grotesk',
      position: 'Center Stage',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#10b981',
  },
  {
    id: 'youtube-cta-bar',
    name: 'YouTube Creator CTA Bar',
    description:
      'High-framerate tactile subscribe button press animation with vector cursor click and smooth interactive state morph.',
    tier: 'free',
    category: 'Creator CTA',
    component: YoutubeCreatorActionBar,
    defaultProps: {
      handle: '@alexandervance',
      platform: 'youtube',
      ctaText: 'SUBSCRIBE FOR WEEKLY DROPS',
      primaryColor: '#ef4444',
      accentColor: '#f59e0b',
      fontFamily: 'Outfit',
      position: 'Center Stage',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#ef4444',
  },
  {
    id: 'swiss-title-split',
    name: 'Swiss Title Split',
    description:
      'Cinematic A24 / Apple Keynote chapter title with precision hairline rule that expands horizontally across the frame.',
    tier: 'free',
    category: 'Broadcast Lower Third',
    component: MinimalSwissTitleSplit,
    defaultProps: {
      title: 'Cinematic Horizons',
      subtitle: 'The art of precision visual engineering and automated typography.',
      tagline: 'Episode 04 • Editorial Cut',
      primaryColor: '#ffffff',
      secondaryColor: '#60a5fa',
      fontFamily: 'Montserrat',
      position: 'Center Stage',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#60a5fa',
  },
  {
    id: 'glass-product-callout',
    name: 'Glass Product Callout',
    description:
      'E-commerce & SaaS feature tag with animated pointer line, anchor point, price/spec badge, and frosted glass tag.',
    tier: 'free',
    category: 'SaaS UI Callout',
    component: GlassProductCallout,
    defaultProps: {
      primaryText: 'Studio Display Pro',
      secondaryText: 'Retina 5K • Nano-Texture Glass',
      badgeText: '$1,599 • BESTSELLER',
      accentColor: '#38bdf8',
      secondaryColor: '#818cf8',
      fontFamily: 'Inter',
      position: 'center',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#38bdf8',
  },
  {
    id: 'social-quote-card',
    name: 'Social Quote Card',
    description:
      'Minimalist testimonial quote frame with verified author badge, handle, and fluid word-by-word reveal.',
    tier: 'free',
    category: 'Viral Hook',
    component: SocialQuoteCard,
    defaultProps: {
      primaryText: '“Motioneer replaced our entire After Effects render farm in 24 hours.”',
      secondaryText: 'Head of Production, Horizon Studio',
      badgeText: '@marcus_vfx',
      accentColor: '#38bdf8',
      secondaryColor: '#6366f1',
      fontFamily: 'Inter',
      position: 'center',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#38bdf8',
  },
  {
    id: 'breaking-ticker-bar',
    name: 'Breaking Ticker Bar',
    description:
      'Broadcast live news lower strap with animated headline tag and continuous live scrolling marquee sub-bar.',
    tier: 'free',
    category: 'Broadcast Lower Third',
    component: BreakingTickerBar,
    defaultProps: {
      primaryText: 'GLOBAL MARKETS RALLY AS TECH INDEX BREAKS ALL-TIME HIGH',
      secondaryText: 'NASDAQ +2.4% • S&P 500 +1.8% • BITCOIN CROSSES $98,000 • SEMICONDUCTOR SURGE',
      badgeText: 'BREAKING NEWS',
      accentColor: '#ef4444',
      secondaryColor: '#f59e0b',
      fontFamily: 'Inter',
      position: 'bottom-center',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#ef4444',
  },
  {
    id: 'chapter-progress-pill',
    name: 'Chapter Progress Pill',
    description:
      'Tutorial & video essay section marker displaying chapter step indicator and fluid gradient progress bar.',
    tier: 'free',
    category: 'SaaS UI Callout',
    component: ChapterProgressPill,
    defaultProps: {
      primaryText: 'Setting Up Remotion Bundler & Cloud Renders',
      secondaryText: 'Module 02: Architecture & GPU Execution',
      badgeText: '02 / 04',
      accentColor: '#6366f1',
      secondaryColor: '#38bdf8',
      fontFamily: 'Inter',
      position: 'top-center',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#6366f1',
  },
  {
    id: 'versus-comparison-split',
    name: 'Versus Comparison Split',
    description:
      'Two-column animated comparison card sliding in with opposing spring physics for before/after and feature comparisons.',
    tier: 'free',
    category: 'Data KPI',
    component: VersusComparisonSplit,
    defaultProps: {
      primaryText: 'Motioneer Cloud GPU',
      secondaryText: 'Traditional After Effects',
      badgeText: '10X SPEEDUP',
      accentColor: '#10b981',
      secondaryColor: '#ef4444',
      fontFamily: 'Inter',
      position: 'center',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#10b981',
  },
  {
    id: 'minimal-corner-bug',
    name: 'Minimal Corner Bug',
    description:
      'Sleek channel brand watermark and live corner bug with subtle glass backdrop and rotating geometric emblem.',
    tier: 'free',
    category: 'Broadcast Lower Third',
    component: MinimalCornerBug,
    defaultProps: {
      primaryText: 'MOTIONEER NETWORK',
      secondaryText: 'LIVE 4K',
      badgeText: 'REC',
      accentColor: '#ef4444',
      secondaryColor: '#ffffff',
      fontFamily: 'Inter',
      position: 'top-right',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#ef4444',
  },
  // Legacy Aliases for backwards compatibility
  {
    id: 'corporate-glass',
    name: 'Apple Glass Speaker Card (Legacy)',
    description: 'Legacy alias for Editorial Lower Third.',
    tier: 'free',
    category: 'Broadcast Lower Third',
    component: EditorialLowerThird,
    defaultProps: {
      primaryText: 'Alexander Vance',
      secondaryText: 'Senior Technology Correspondent',
      badgeText: 'BLOOMBERG VERGE',
      accentColor: '#38bdf8',
      secondaryColor: '#6366f1',
      fontFamily: 'Inter',
      position: 'bottom-left',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#38bdf8',
  },
  {
    id: 'neon-podcast',
    name: 'Podcast Waveform Pill (Legacy)',
    description: 'Legacy alias for Podcast Voice Wave.',
    tier: 'free',
    category: 'SaaS UI Callout',
    component: PodcastVoiceWave,
    defaultProps: {
      primaryText: 'Nimit Biswas',
      secondaryText: 'Founder, Smart Bros',
      badgeText: 'EPISODE 01',
      accentColor: '#EC4899',
      secondaryColor: '#F43F5E',
      fontFamily: 'Inter',
      position: 'center',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#EC4899',
  },
  {
    id: 'kinetic-bounce',
    name: 'Vox Kinetic Highlighter (Legacy)',
    description: 'Legacy alias for Vox Kinetic Highlighter.',
    tier: 'free',
    category: 'Viral Hook',
    component: VoxKineticHighlighter,
    defaultProps: {
      phrase1: 'STOP OPENING',
      phrase2: 'AFTER EFFECTS FOR',
      hookWord: 'SIMPLE GRAPHICS',
      tagline: '10X FASTER WORKFLOW',
      primaryColor: '#f43f5e',
      accentColor: '#facc15',
      fontFamily: 'Plus Jakarta Sans',
      position: 'Center Stage',
      isFree: false,
    },
    aspectRatios: ['9:16', '16:9', '1:1'],
    accentColor: '#f43f5e',
  },
  {
    id: 'metric-counter',
    name: 'Stripe Metric Bento Card (Legacy)',
    description: 'Legacy alias for KPI Metric Counter.',
    tier: 'free',
    category: 'Data KPI',
    component: StripeMetricBentoCard,
    defaultProps: {
      label: 'Conversion Velocity',
      targetValue: 384,
      prefix: '+',
      suffix: '%',
      trendText: '+48.2% vs Previous Quarter',
      isPositive: true,
      primaryColor: '#10b981',
      accentColor: '#3b82f6',
      fontFamily: 'Cabinet Grotesk',
      position: 'Center Stage',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#10b981',
  },
  {
    id: 'social-creator',
    name: 'YouTube Creator Action Bar (Legacy)',
    description: 'Legacy alias for YouTube Creator CTA Bar.',
    tier: 'free',
    category: 'Creator CTA',
    component: YoutubeCreatorActionBar,
    defaultProps: {
      handle: '@alexandervance',
      platform: 'youtube',
      ctaText: 'SUBSCRIBE FOR WEEKLY DROPS',
      primaryColor: '#ef4444',
      accentColor: '#f59e0b',
      fontFamily: 'Outfit',
      position: 'Center Stage',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#ef4444',
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Swiss Title Split (Legacy)',
    description: 'Legacy alias for Swiss Title Split.',
    tier: 'free',
    category: 'Broadcast Lower Third',
    component: MinimalSwissTitleSplit,
    defaultProps: {
      title: 'Cinematic Horizons',
      subtitle: 'The art of precision visual engineering and automated typography.',
      tagline: 'Episode 04 • Editorial Cut',
      primaryColor: '#ffffff',
      secondaryColor: '#60a5fa',
      fontFamily: 'Montserrat',
      position: 'Center Stage',
      isFree: false,
    },
    aspectRatios: ['16:9', '9:16', '1:1'],
    accentColor: '#60a5fa',
  },
];
