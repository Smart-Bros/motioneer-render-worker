import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Watermark } from '../Watermark';
import {
  resolveSfxUrl,
  resolveSpringPhysics,
  SfxTrigger,
  MotionBlurWrapper,
  computeTransitionTransform,
} from '../motionEcosystem';

export interface SocialQuoteCardProps {
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
}

export const SocialQuoteCard: React.FC<SocialQuoteCardProps> = ({
  primaryText = '“Motioneer replaced our entire After Effects render farm in 24 hours.”',
  secondaryText = 'Head of Production, Horizon Studio',
  badgeText = '@marcus_vfx',
  accentColor = '#38bdf8',
  secondaryColor = '#6366f1',
  fontFamily = 'Inter, -apple-system, sans-serif',
  position = 'center',
  isFree = false,
  sfxType = 'none',
  transitionStyle = 'fade',
  springPhysics = 'editorial',
  motionBlur = false,
  canvasBgColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const scale = Math.min(width, height) / 1080;
  const springConfig = resolveSpringPhysics(springPhysics);

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: springConfig,
  });

  // Exit transition
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

  // Word by word reveal
  const words = primaryText.split(' ');
  const sfxAudioUrl = resolveSfxUrl(sfxType, isFree);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: `${Math.round(width * 0.08)}px`,
        paddingRight: `${Math.round(width * 0.08)}px`,
        backgroundColor: canvasBgColor || 'transparent',
        fontFamily,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <SfxTrigger sfxUrl={sfxAudioUrl} durationInFrames={durationInFrames} />

      <MotionBlurWrapper enabled={motionBlur} isFree={isFree}>
        <div
          style={{
            transform,
            opacity,
            clipPath,
            width: '92%',
            maxWidth: `${820 * scale}px`,
            backgroundColor: 'rgba(11, 12, 16, 0.94)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: `${20 * scale}px`,
            padding: `${28 * scale}px ${36 * scale}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${18 * scale}px`,
            boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.85)',
          }}
        >
          {/* Header: Author + Verified Check */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${12 * scale}px` }}>
              <div
                style={{
                  width: `${42 * scale}px`,
                  height: `${42 * scale}px`,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: `${16 * scale}px`,
                }}
              >
                {badgeText.replace('@', '')[0]?.toUpperCase() || 'M'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: `${6 * scale}px` }}>
                  <span style={{ fontSize: `${Math.round(16 * scale)}px`, fontWeight: 700, color: '#fff' }}>
                    {badgeText}
                  </span>
                  {/* Verified SVG badge */}
                  <svg width={`${15 * scale}px`} height={`${15 * scale}px`} viewBox="0 0 24 24" fill="#38bdf8">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <span style={{ fontSize: `${Math.round(12 * scale)}px`, color: '#9ca3af' }}>
                  {secondaryText}
                </span>
              </div>
            </div>
            <span style={{ fontSize: `${Math.round(11 * scale)}px`, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              VERIFIED REVIEW
            </span>
          </div>

          {/* Quote body with word by word reveal */}
          <div
            style={{
              fontSize: `${Math.round(24 * scale)}px`,
              fontWeight: 600,
              color: '#f3f4f6',
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
            }}
          >
            {words.map((word, i) => {
              const wordDelay = 6 + i * 2;
              const wordOpacity = interpolate(frame, [wordDelay, wordDelay + 3], [0.15, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              return (
                <span key={i} style={{ opacity: wordOpacity, transition: 'opacity 0.1s' }}>
                  {word}{' '}
                </span>
              );
            })}
          </div>
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
