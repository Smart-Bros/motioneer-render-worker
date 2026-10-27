import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Watermark } from '../Watermark';
import {
  resolveSfxUrl,
  resolveSpringPhysics,
  SfxTrigger,
  MotionBlurWrapper,
} from '../motionEcosystem';

export interface VoxKineticHighlighterProps {
  phrase1?: string;
  phrase2?: string;
  hookWord?: string;
  tagline?: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  position?: 'Center Stage' | 'Bottom Safe-Zone';
  isFree?: boolean;
  sfxType?: string;
  transitionStyle?: string;
  springPhysics?: string;
  motionBlur?: boolean;
  canvasBgColor?: string;
}

export const VoxKineticHighlighter: React.FC<VoxKineticHighlighterProps> = ({
  phrase1 = 'STOP OPENING',
  phrase2 = 'AFTER EFFECTS FOR',
  hookWord = 'SIMPLE GRAPHICS',
  tagline = '🔥 10X FASTER WORKFLOW',
  primaryColor = '#f43f5e',
  accentColor = '#facc15',
  fontFamily = 'Plus Jakarta Sans, Montserrat, system-ui, sans-serif',
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
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.88]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Spring physics from ecosystem
  const springConfig = resolveSpringPhysics(springPhysics);

  const tagSpring = spring({
    frame,
    fps,
    config: springConfig,
  });

  // Staggered words for phrase 1 & phrase 2
  const words1 = phrase1.trim().split(/\s+/).filter(Boolean);
  const words2 = phrase2.trim().split(/\s+/).filter(Boolean);

  // Power Phrase / Hook word entrance and highlighter marker sweep
  const hookDelay = 6 + (words1.length + words2.length) * 3;
  const hookSpring = spring({
    frame: frame - hookDelay,
    fps,
    config: springConfig,
  });

  // Highlighter marker sweep (scaleX from 0 to 1 with slight -2deg tilt)
  const markerSpring = spring({
    frame: frame - (hookDelay + 4),
    fps,
    config: { damping: 14, stiffness: 160 },
  });

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
            gap: `${18 * scale}px`,
            maxWidth: '92%',
            transform: `scale(${exitScale})`,
            opacity: exitOpacity,
            position: 'relative',
          }}
        >
          {/* Top Floating Pill / Tagline */}
          {tagline && (
            <div
              style={{
                transform: `scale(${Math.max(0, tagSpring)})`,
                backgroundColor: 'rgba(18, 18, 22, 0.94)',
                backdropFilter: 'blur(20px)',
                border: `1.5px solid ${accentColor}80`,
                borderRadius: '9999px',
                padding: `${8 * scale}px ${24 * scale}px`,
                boxShadow: `0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px ${accentColor}40`,
              }}
            >
              <span
                style={{
                  fontSize: `${Math.round(15 * scale)}px`,
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {tagline}
              </span>
            </div>
          )}

          {/* Phrase 1: Word-by-word 3D Rotation Pop */}
          {words1.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: `${16 * scale}px`,
                perspective: 1000,
              }}
            >
              {words1.map((word, i) => {
                const wSpring = spring({
                  frame: frame - (4 + i * 3),
                  fps,
                  config: springConfig,
                });
                const rotateX = interpolate(wSpring, [0, 1], [60, 0]);
                const translateY = interpolate(wSpring, [0, 1], [30 * scale, 0]);

                return (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      transform: `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${Math.max(0, wSpring)})`,
                      fontSize: `${Math.round(48 * scale)}px`,
                      fontWeight: 900,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                      textShadow: '0 10px 30px rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          )}

          {/* Phrase 2: Word-by-word 3D Rotation Pop */}
          {words2.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: `${16 * scale}px`,
                perspective: 1000,
              }}
            >
              {words2.map((word, i) => {
                const wSpring = spring({
                  frame: frame - (8 + words1.length * 3 + i * 3),
                  fps,
                  config: springConfig,
                });
                const rotateX = interpolate(wSpring, [0, 1], [60, 0]);
                const translateY = interpolate(wSpring, [0, 1], [30 * scale, 0]);

                return (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      transform: `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${Math.max(0, wSpring)})`,
                      fontSize: `${Math.round(46 * scale)}px`,
                      fontWeight: 900,
                      color: '#e4e4e7',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                      textShadow: '0 10px 30px rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          )}

          {/* Key Power Phrase with Animated Highlighter Marker Sweep */}
          {hookWord && (
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                transform: `scale(${Math.max(0, hookSpring)})`,
                marginTop: `${8 * scale}px`,
                padding: `${12 * scale}px ${32 * scale}px`,
              }}
            >
              {/* Animated Highlighter Marker Box (sweeps scaleX 0 to 1 with -2deg tilt) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: `${14 * scale}px`,
                  background: `linear-gradient(135deg, ${accentColor}, ${primaryColor})`,
                  transform: `scaleX(${Math.max(0, Math.min(1, markerSpring))}) rotate(-2deg)`,
                  transformOrigin: 'left center',
                  boxShadow: `0 15px 45px -5px ${primaryColor}90, 0 0 30px ${accentColor}60`,
                  zIndex: 0,
                }}
              />

              {/* Glowing sweep shine */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: `${14 * scale}px`,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  transform: 'rotate(-2deg)',
                  opacity: interpolate(frame, [hookDelay + 6, hookDelay + 24], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />

              <span
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: `${Math.round(54 * scale)}px`,
                  fontWeight: 950,
                  color: '#09090b',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {hookWord}
              </span>
            </div>
          )}
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
