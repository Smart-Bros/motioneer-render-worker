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

export interface MinimalCornerBugProps {
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

export const MinimalCornerBug: React.FC<MinimalCornerBugProps> = ({
  primaryText = 'MOTIONEER NETWORK',
  secondaryText = 'LIVE 4K',
  badgeText = 'REC',
  accentColor = '#ef4444',
  secondaryColor = '#ffffff',
  fontFamily = 'Inter, -apple-system, sans-serif',
  position = 'top-right',
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
  const isTopRight = position === 'top-right' || position === 'center';

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

  // Gentle rotating geometric icon
  const rotation = (frame * 1.5) % 360;
  const pulse = Math.sin(frame / 6) * 0.2 + 0.8;

  const sfxAudioUrl = resolveSfxUrl(sfxType, isFree);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isTopRight ? 'flex-start' : 'flex-end',
        alignItems: isTopRight ? 'flex-end' : 'flex-start',
        paddingTop: isTopRight ? `${Math.round(height * 0.08)}px` : undefined,
        paddingBottom: !isTopRight ? `${Math.round(height * 0.08)}px` : undefined,
        paddingRight: isTopRight ? `${Math.round(width * 0.06)}px` : undefined,
        paddingLeft: !isTopRight ? `${Math.round(width * 0.06)}px` : undefined,
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
            backgroundColor: 'rgba(10, 10, 14, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: `${12 * scale}px`,
            padding: `${8 * scale}px ${16 * scale}px`,
            display: 'flex',
            alignItems: 'center',
            gap: `${10 * scale}px`,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Rotating Geometric Emblem */}
          <div
            style={{
              width: `${20 * scale}px`,
              height: `${20 * scale}px`,
              borderRadius: `${4 * scale}px`,
              border: `1.5px solid ${accentColor}`,
              transform: `rotate(${rotation}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: `${6 * scale}px`,
                height: `${6 * scale}px`,
                backgroundColor: accentColor,
                borderRadius: '50%',
                opacity: pulse,
              }}
            />
          </div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: `${Math.round(11 * scale)}px`, fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em' }}>
              {primaryText}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${6 * scale}px` }}>
              <span style={{ fontSize: `${Math.round(9 * scale)}px`, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {secondaryText}
              </span>
              <span style={{ fontSize: `${Math.round(8 * scale)}px`, fontWeight: 900, color: accentColor, backgroundColor: `${accentColor}20`, padding: `${1 * scale}px ${4 * scale}px`, borderRadius: `${2 * scale}px` }}>
                {badgeText}
              </span>
            </div>
          </div>
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
