import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Watermark } from '../Watermark';
import {
  resolveSfxUrl,
  resolveSpringPhysics,
  SfxTrigger,
  MotionBlurWrapper,
  computeTransitionTransform,
  resolveTemplateWrapperPosition,
} from '../motionEcosystem';

export interface PodcastVoiceWaveProps {
  primaryText?: string;
  secondaryText?: string;
  badgeText?: string;
  accentColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  position?: string;
  isFree?: boolean;
  sfxType?: string;
  transitionStyle?: string;
  springPhysics?: string;
  motionBlur?: boolean;
  canvasBgColor?: string;
  // Legacy aliases
  guestName?: string;
  topic?: string;
  episode?: string;
  neonColor?: string;
}

export const PodcastVoiceWave: React.FC<PodcastVoiceWaveProps> = ({
  primaryText,
  secondaryText,
  badgeText,
  accentColor = '#EC4899',
  secondaryColor = '#F43F5E',
  fontFamily = 'Inter, -apple-system, sans-serif',
  position = 'center',
  isFree = false,
  sfxType = 'none',
  transitionStyle = 'fade',
  springPhysics = 'editorial',
  motionBlur = false,
  canvasBgColor,
  guestName,
  topic,
  episode,
  neonColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const speakerName = primaryText || guestName || 'Nimit Biswas';
  const speakerRole = secondaryText || topic || 'Founder, Smart Bros';
  const tag = badgeText || episode || 'VOICE NOTE';
  const colA = accentColor || neonColor || '#EC4899';
  const colB = secondaryColor || '#F43F5E';

  // Dynamic scale bounded by 1080p reference
  const scale = Math.min(width, height) / 1080;
  const isBottom = position === 'Bottom Safe-Zone' || position === 'bottom-center' || position === 'bottom-left';

  // Configurable spring physics from ecosystem
  const springConfig = resolveSpringPhysics(springPhysics);
  const entrance = spring({
    frame,
    fps,
    config: springConfig,
  });

  // Exit transition in final 20 frames
  const exitStart = Math.max(0, durationInFrames - 20);
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const { transform, opacity, clipPath } = computeTransitionTransform({
    style: transitionStyle,
    entrance,
    exitProgress,
    scale,
    isFree,
  });

  // Speaker Initials
  const initials = speakerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'NB';

  const numBars = 24;
  const sfxAudioUrl = resolveSfxUrl(sfxType, isFree);

  const posStyle = resolveTemplateWrapperPosition(position);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: posStyle.justifyContent,
        alignItems: posStyle.alignItems,
        padding: posStyle.padding,
        backgroundColor: canvasBgColor || 'transparent',
        fontFamily,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <SfxTrigger sfxUrl={sfxAudioUrl} durationInFrames={durationInFrames} />

      <MotionBlurWrapper enabled={motionBlur} isFree={isFree}>
        {/* Matte Minimal Pill Container */}
        <div
          style={{
            transform,
            opacity,
            clipPath,
            width: '92%',
            maxWidth: `${960 * scale}px`,
            backgroundColor: 'rgba(15, 15, 18, 0.94)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: `${24 * scale}px`,
            padding: `${22 * scale}px ${28 * scale}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: `${24 * scale}px`,
            boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
            position: 'relative',
          }}
        >
          {/* Left: Speaker Initials Avatar Ring & Typography */}
          <div style={{ display: 'flex', alignItems: 'center', gap: `${18 * scale}px`, flex: 1, minWidth: 0 }}>
            {/* Avatar Initials Ring with Gradient Border */}
            <div
              style={{
                width: `${58 * scale}px`,
                height: `${58 * scale}px`,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colA}, ${colB})`,
                padding: `${2.5 * scale}px`,
                flexShrink: 0,
                boxShadow: `0 4px 16px -2px ${colA}40`,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#111115',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: `${20 * scale}px`,
                  letterSpacing: '0.02em',
                }}
              >
                {initials}
              </div>
            </div>

            {/* Speaker Text Hierarchy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${3 * scale}px`, minWidth: 0 }}>
              {/* Tag Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: `${8 * scale}px` }}>
                <span
                  style={{
                    fontSize: `${Math.round(11 * scale)}px`,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: colA,
                    backgroundColor: `${colA}18`,
                    border: `1px solid ${colA}35`,
                    borderRadius: `${6 * scale}px`,
                    padding: `${2 * scale}px ${8 * scale}px`,
                  }}
                >
                  {tag}
                </span>
              </div>

              {/* Primary Speaker Name */}
              <div
                style={{
                  fontSize: `${Math.round(28 * scale)}px`,
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {speakerName}
              </div>

              {/* Secondary Role / Subtitle */}
              <div
                style={{
                  fontSize: `${Math.round(14 * scale)}px`,
                  fontWeight: 500,
                  color: '#9ca3af',
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {speakerRole}
              </div>
            </div>
          </div>

          {/* Right: 24-bar Reactive SVG Waveform with Dual-Color Gradient */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${4.5 * scale}px`,
              height: `${56 * scale}px`,
              padding: `${8 * scale}px ${16 * scale}px`,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              borderRadius: `${14 * scale}px`,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              flexShrink: 0,
            }}
          >
            {Array.from({ length: numBars }).map((_, i) => {
              // Smooth natural waveform motion
              const sin1 = Math.sin(frame / 3.2 + i * 0.45);
              const cos1 = Math.cos(frame / 4.8 + i * 0.35);
              const sin2 = Math.sin(frame / 2.1 + i * 0.6);
              const factor = Math.max(0.12, (sin1 * 0.5 + cos1 * 0.3 + sin2 * 0.2 + 1) / 2);
              const barHeight = Math.round(44 * scale * factor);

              return (
                <div
                  key={i}
                  style={{
                    width: `${4.5 * scale}px`,
                    height: `${barHeight}px`,
                    borderRadius: `${2.5 * scale}px`,
                    background: `linear-gradient(180deg, ${colA}, ${colB})`,
                    transition: 'height 0.05s ease',
                  }}
                />
              );
            })}
          </div>
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
