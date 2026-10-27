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

export interface GlassProductCalloutProps {
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

export const GlassProductCallout: React.FC<GlassProductCalloutProps> = ({
  primaryText = 'Studio Display Pro',
  secondaryText = 'Retina 5K • Nano-Texture Glass',
  badgeText = '$1,599 • BESTSELLER',
  accentColor = '#38bdf8',
  secondaryColor = '#818cf8',
  fontFamily = 'Inter, system-ui, sans-serif',
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

  // Pointer line expands from anchor
  const lineSpring = spring({
    frame,
    fps,
    config: springConfig,
  });

  // Card fades & slides in
  const cardSpring = spring({
    frame: frame - 6,
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
    entrance: cardSpring,
    exitProgress,
    scale,
    isFree,
  });

  const lineWidth = interpolate(lineSpring, [0, 1], [0, 80 * scale]);
  const sfxAudioUrl = resolveSfxUrl(sfxType, isFree);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: canvasBgColor || 'transparent',
        fontFamily,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <SfxTrigger sfxUrl={sfxAudioUrl} durationInFrames={durationInFrames} />

      <MotionBlurWrapper enabled={motionBlur} isFree={isFree}>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          {/* Anchor point */}
          <div
            style={{
              width: `${14 * scale}px`,
              height: `${14 * scale}px`,
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 16px ${accentColor}`,
              flexShrink: 0,
              zIndex: 2,
            }}
          />

          {/* Pointer Line */}
          <div
            style={{
              width: `${lineWidth}px`,
              height: `${2 * scale}px`,
              background: `linear-gradient(90deg, ${accentColor}, ${secondaryColor})`,
              flexShrink: 0,
            }}
          />

          {/* Frosted Product Card */}
          <div
            style={{
              transform,
              opacity,
              clipPath,
              backgroundColor: 'rgba(12, 12, 16, 0.92)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: `${16 * scale}px`,
              padding: `${20 * scale}px ${26 * scale}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: `${6 * scale}px`,
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
              minWidth: `${300 * scale}px`,
            }}
          >
            {/* Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: `${Math.round(11 * scale)}px`,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: accentColor,
                  backgroundColor: `${accentColor}18`,
                  border: `1px solid ${accentColor}40`,
                  borderRadius: `${6 * scale}px`,
                  padding: `${2 * scale}px ${8 * scale}px`,
                }}
              >
                {badgeText}
              </span>
              <span style={{ fontSize: `${Math.round(11 * scale)}px`, color: '#fbbf24', fontWeight: 600, letterSpacing: '0.04em' }}>
                4.9 / 5.0
              </span>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: `${Math.round(24 * scale)}px`,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {primaryText}
            </div>

            {/* Specs / Subtitle */}
            <div
              style={{
                fontSize: `${Math.round(13 * scale)}px`,
                fontWeight: 500,
                color: '#9ca3af',
                lineHeight: 1.25,
              }}
            >
              {secondaryText}
            </div>
          </div>
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
