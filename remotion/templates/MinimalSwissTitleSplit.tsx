import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Watermark } from '../Watermark';
import {
  resolveSfxUrl,
  resolveSpringPhysics,
  SfxTrigger,
  MotionBlurWrapper,
} from '../motionEcosystem';

export interface MinimalSwissTitleSplitProps {
  title?: string;
  subtitle?: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  position?: 'Center Stage' | 'Bottom Safe-Zone';
  isFree?: boolean;
  sfxType?: string;
  transitionStyle?: string;
  springPhysics?: string;
  motionBlur?: boolean;
  canvasBgColor?: string;
}

export const MinimalSwissTitleSplit: React.FC<MinimalSwissTitleSplitProps> = ({
  title = 'CINEMATIC HORIZONS',
  subtitle = 'The art of precision visual engineering and automated typography.',
  tagline = 'EPISODE 04 • EDITORIAL CUT',
  primaryColor = '#ffffff',
  secondaryColor = '#60a5fa',
  fontFamily = 'Montserrat, Inter, system-ui, sans-serif',
  position = 'Center Stage',
  isFree = false,
  sfxType = 'none',
  transitionStyle = 'fade',
  springPhysics = 'editorial',
  motionBlur = false,
  canvasBgColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  // Unified dynamic scale bounded by smaller dimension to guarantee no edge clipping
  const scale = Math.min(width, height) / 1080;
  const isSafeZone = position === 'Bottom Safe-Zone';

  // Exit animation in the final 20 frames
  const exitStart = Math.max(0, durationInFrames - 20);
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.94]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Spring physics from ecosystem
  const springConfig = resolveSpringPhysics(springPhysics);

  // Entrance physics
  // 1. Eyebrow Tagline
  const tagOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. Expanding glowing center line (frames 4-22)
  const lineSpring = spring({
    frame: frame - 4,
    fps,
    config: springConfig,
  });
  const lineWidth = interpolate(lineSpring, [0, 1], [0, Math.min(width * 0.75, 900 * scale)]);

  // 3. Top Title sliding down (staggered)
  const titleSpring = spring({
    frame: frame - 8,
    fps,
    config: springConfig,
  });
  const titleTranslateY = interpolate(titleSpring, [0, 1], [-25 * scale, 0]);

  // 4. Bottom Subtitle sliding up (staggered)
  const subtitleSpring = spring({
    frame: frame - 14,
    fps,
    config: springConfig,
  });
  const subtitleTranslateY = interpolate(subtitleSpring, [0, 1], [25 * scale, 0]);

  const sfxAudioUrl = resolveSfxUrl(sfxType, isFree);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isSafeZone ? 'flex-end' : 'center',
        alignItems: 'center',
        paddingBottom: isSafeZone ? `${Math.round(height * 0.12)}px` : 0,
        paddingLeft: isSafeZone ? `${Math.round(width * 0.08)}px` : 0,
        paddingRight: isSafeZone ? `${Math.round(width * 0.08)}px` : 0,
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: `${14 * scale}px`,
            maxWidth: '90%',
            transform: `scale(${exitScale})`,
            opacity: exitOpacity,
            position: 'relative',
          }}
        >
          {/* Eyebrow Tagline */}
          {tagline && (
            <div
              style={{
                opacity: tagOpacity,
                fontSize: `${Math.round(12 * scale)}px`,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: secondaryColor,
                fontFamily: 'monospace',
                textShadow: `0 0 20px ${secondaryColor}60`,
              }}
            >
              {tagline}
            </div>
          )}

          {/* Bold Headline (Slides into Line) */}
          <div
            style={{
              overflow: 'hidden',
              paddingBottom: `${4 * scale}px`,
            }}
          >
            <h1
              style={{
                transform: `translateY(${titleTranslateY}px)`,
                opacity: titleSpring,
                margin: 0,
                fontSize: `${Math.round(52 * scale)}px`,
                fontWeight: 900,
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
                color: primaryColor,
                textTransform: 'uppercase',
                textShadow: '0 15px 40px rgba(0, 0, 0, 0.9)',
              }}
            >
              {title}
            </h1>
          </div>

          {/* Center Precision Hairline Rule */}
          <div
            style={{
              width: `${lineWidth}px`,
              height: `${2 * scale}px`,
              background: `linear-gradient(90deg, transparent, ${secondaryColor}, #ffffff, ${secondaryColor}, transparent)`,
              boxShadow: `0 0 20px ${secondaryColor}80, 0 0 40px ${secondaryColor}40`,
              borderRadius: `${2 * scale}px`,
            }}
          />

          {/* Subtitle / Chapter Synopsis */}
          {subtitle && (
            <div
              style={{
                overflow: 'hidden',
                paddingTop: `${4 * scale}px`,
                maxWidth: `${740 * scale}px`,
              }}
            >
              <p
                style={{
                  transform: `translateY(${subtitleTranslateY}px)`,
                  opacity: subtitleSpring,
                  margin: 0,
                  fontSize: `${Math.round(16 * scale)}px`,
                  fontWeight: 400,
                  color: '#d4d4d8',
                  lineHeight: 1.45,
                  letterSpacing: '0.01em',
                  textShadow: '0 4px 16px rgba(0, 0, 0, 0.8)',
                }}
              >
                {subtitle}
              </p>
            </div>
          )}
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
