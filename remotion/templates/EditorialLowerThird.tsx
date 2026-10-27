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

export interface EditorialLowerThirdProps {
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
  name?: string;
  role?: string;
  company?: string;
  primaryColor?: string;
}

export const EditorialLowerThird: React.FC<EditorialLowerThirdProps> = ({
  primaryText,
  secondaryText,
  badgeText,
  accentColor = '#38bdf8',
  secondaryColor = '#6366f1',
  fontFamily = 'Inter, -apple-system, sans-serif',
  position = 'bottom-left',
  isFree = false,
  sfxType = 'none',
  transitionStyle = 'fade',
  springPhysics = 'editorial',
  motionBlur = false,
  canvasBgColor,
  name,
  role,
  company,
  primaryColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const speakerName = primaryText || name || 'Alexander Vance';
  const speakerTitle = secondaryText || role || 'Senior Technology Correspondent';
  const organization = badgeText || company || 'BLOOMBERG VERGE';
  const barColor = accentColor || primaryColor || '#38bdf8';
  const tagColor = secondaryColor || '#6366f1';

  const scale = Math.min(width, height) / 1080;
  const isBottom = position === 'bottom-left' || position === 'Bottom Safe-Zone' || position === 'bottom-center';

  // Configurable spring physics from ecosystem
  const springConfig = resolveSpringPhysics(springPhysics);

  const blockWipe = spring({
    frame,
    fps,
    config: springConfig,
  });

  const textSlide = spring({
    frame: frame - 4,
    fps,
    config: springConfig,
  });

  // Exit transition in final 18 frames
  const exitStart = Math.max(0, durationInFrames - 18);
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const { transform, opacity, clipPath } = computeTransitionTransform({
    style: transitionStyle,
    entrance: textSlide,
    exitProgress,
    scale,
    isFree,
  });

  const blockWidth = interpolate(blockWipe, [0, 1], [0, 10 * scale]);
  const sfxAudioUrl = resolveSfxUrl(sfxType, isFree);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isBottom ? 'flex-end' : 'center',
        alignItems: isBottom ? 'flex-start' : 'center',
        paddingBottom: isBottom ? `${Math.round(height * 0.1)}px` : 0,
        paddingLeft: isBottom ? `${Math.round(width * 0.08)}px` : 0,
        paddingRight: isBottom ? 0 : 0,
        backgroundColor: canvasBgColor || 'transparent',
        fontFamily,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <SfxTrigger sfxUrl={sfxAudioUrl} durationInFrames={durationInFrames} />

      <MotionBlurWrapper enabled={motionBlur} isFree={isFree}>
        {/* Two-Tone Architectural Lower Third Container */}
        <div
          style={{
            transform,
            opacity,
            clipPath,
            display: 'flex',
            alignItems: 'stretch',
            boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.75)',
            borderRadius: `${8 * scale}px`,
            overflow: 'hidden',
          }}
        >
          {/* Crisp Wipe-In Vertical Accent Block */}
          <div
            style={{
              width: `${blockWidth}px`,
              backgroundColor: barColor,
              flexShrink: 0,
            }}
          />

          {/* Main Content Pane */}
          <div
            style={{
              backgroundColor: 'rgba(10, 11, 14, 0.94)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderLeft: 'none',
              padding: `${16 * scale}px ${28 * scale}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: `${4 * scale}px`,
            }}
          >
            {/* Organization Tag Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: `${8 * scale}px` }}>
              <span
                style={{
                  fontSize: `${Math.round(10 * scale)}px`,
                  fontWeight: 800,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: tagColor,
                }}
              >
                {organization}
              </span>
            </div>

            {/* Bold Geometric Name */}
            <div
              style={{
                fontSize: `${Math.round(28 * scale)}px`,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {speakerName}
            </div>

            {/* Muted Uppercase Role Subtitle */}
            <div
              style={{
                fontSize: `${Math.round(12 * scale)}px`,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#9ca3af',
                lineHeight: 1.25,
              }}
            >
              {speakerTitle}
            </div>
          </div>
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
