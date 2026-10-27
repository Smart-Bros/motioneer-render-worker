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

export interface ChapterProgressPillProps {
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

export const ChapterProgressPill: React.FC<ChapterProgressPillProps> = ({
  primaryText = 'Setting Up Remotion Bundler & Cloud Renders',
  secondaryText = 'Module 02: Architecture & GPU Execution',
  badgeText = '02 / 04',
  accentColor = '#6366f1',
  secondaryColor = '#38bdf8',
  fontFamily = 'Inter, -apple-system, sans-serif',
  position = 'top-center',
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
  const isTop = position === 'top-center' || position === 'top-right' || position === 'center';

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

  // Segment progress animation
  const progressSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const progressPercent = interpolate(progressSpring, [0, 1], [0, 50]);

  const sfxAudioUrl = resolveSfxUrl(sfxType, isFree);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isTop ? 'flex-start' : 'flex-end',
        alignItems: 'center',
        paddingTop: isTop ? `${Math.round(height * 0.08)}px` : undefined,
        paddingBottom: !isTop ? `${Math.round(height * 0.08)}px` : undefined,
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
            backgroundColor: 'rgba(12, 13, 18, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: `${18 * scale}px`,
            padding: `${16 * scale}px ${24 * scale}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${10 * scale}px`,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            minWidth: `${420 * scale}px`,
          }}
        >
          {/* Top: Step Badge + Chapter Name */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${16 * scale}px` }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${2 * scale}px` }}>
              <span style={{ fontSize: `${Math.round(11 * scale)}px`, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: secondaryColor }}>
                {secondaryText}
              </span>
              <span style={{ fontSize: `${Math.round(18 * scale)}px`, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                {primaryText}
              </span>
            </div>

            <div
              style={{
                backgroundColor: `${accentColor}25`,
                border: `1px solid ${accentColor}60`,
                color: '#ffffff',
                fontSize: `${Math.round(13 * scale)}px`,
                fontWeight: 800,
                padding: `${4 * scale}px ${10 * scale}px`,
                borderRadius: `${8 * scale}px`,
                flexShrink: 0,
              }}
            >
              {badgeText}
            </div>
          </div>

          {/* Bottom: Segmented Progress Bar */}
          <div
            style={{
              width: '100%',
              height: `${4 * scale}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: `${2 * scale}px`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${accentColor}, ${secondaryColor})`,
                borderRadius: `${2 * scale}px`,
              }}
            />
          </div>
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
