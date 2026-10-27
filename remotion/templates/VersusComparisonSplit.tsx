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

export interface VersusComparisonSplitProps {
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

export const VersusComparisonSplit: React.FC<VersusComparisonSplitProps> = ({
  primaryText = 'Motioneer Cloud GPU',
  secondaryText = 'Traditional After Effects',
  badgeText = '10X SPEEDUP',
  accentColor = '#10b981',
  secondaryColor = '#ef4444',
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

  // Configurable spring physics from ecosystem
  const springConfig = resolveSpringPhysics(springPhysics);
  const leftSpring = spring({
    frame,
    fps,
    config: springConfig,
  });

  const rightSpring = spring({
    frame: frame - 4,
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
    entrance: leftSpring,
    exitProgress,
    scale,
    isFree,
  });

  const leftTranslateX = interpolate(leftSpring, [0, 1], [-60 * scale, 0]);
  const rightTranslateX = interpolate(rightSpring, [0, 1], [60 * scale, 0]);

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
            display: 'flex',
            alignItems: 'center',
            gap: `${16 * scale}px`,
            position: 'relative',
          }}
        >
          {/* Left Column (Winner / Motioneer) */}
          <div
            style={{
              transform: `translateX(${leftTranslateX}px)`,
              backgroundColor: 'rgba(12, 16, 14, 0.94)',
              backdropFilter: 'blur(20px)',
              border: `1.5px solid ${accentColor}60`,
              borderRadius: `${18 * scale}px`,
              padding: `${24 * scale}px ${30 * scale}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: `${8 * scale}px`,
              boxShadow: `0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px ${accentColor}20`,
              minWidth: `${280 * scale}px`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: `${Math.round(11 * scale)}px`, fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                ● SOLUTION
              </span>
              <span style={{ fontSize: `${Math.round(10 * scale)}px`, fontWeight: 800, color: '#ffffff', backgroundColor: `${accentColor}30`, padding: `${2 * scale}px ${6 * scale}px`, borderRadius: `${4 * scale}px` }}>
                {badgeText}
              </span>
            </div>
            <span style={{ fontSize: `${Math.round(22 * scale)}px`, fontWeight: 800, color: '#ffffff' }}>
              {primaryText}
            </span>
            <span style={{ fontSize: `${Math.round(13 * scale)}px`, color: '#6ee7b7', fontWeight: 600 }}>
              ⚡ 2.4s Server-Side Render
            </span>
          </div>

          {/* VS Badge in center */}
          <div
            style={{
              width: `${44 * scale}px`,
              height: `${44 * scale}px`,
              borderRadius: '50%',
              backgroundColor: '#1f2937',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: `${14 * scale}px`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              zIndex: 10,
            }}
          >
            VS
          </div>

          {/* Right Column (Legacy / Alternative) */}
          <div
            style={{
              transform: `translateX(${rightTranslateX}px)`,
              backgroundColor: 'rgba(16, 12, 14, 0.94)',
              backdropFilter: 'blur(20px)',
              border: `1.5px solid ${secondaryColor}60`,
              borderRadius: `${18 * scale}px`,
              padding: `${24 * scale}px ${30 * scale}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: `${8 * scale}px`,
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
              minWidth: `${280 * scale}px`,
            }}
          >
            <span style={{ fontSize: `${Math.round(11 * scale)}px`, fontWeight: 800, color: secondaryColor, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              ● LEGACY
            </span>
            <span style={{ fontSize: `${Math.round(22 * scale)}px`, fontWeight: 800, color: '#ffffff' }}>
              {secondaryText}
            </span>
            <span style={{ fontSize: `${Math.round(13 * scale)}px`, color: '#fca5a5', fontWeight: 600 }}>
              ⏳ 45m Manual Local Export
            </span>
          </div>
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
