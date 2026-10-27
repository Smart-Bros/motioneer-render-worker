import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Icon } from '@iconify/react';
import { Watermark } from '../Watermark';
import {
  resolveSfxUrl,
  resolveSpringPhysics,
  SfxTrigger,
  MotionBlurWrapper,
  computeTransitionTransform,
} from '../motionEcosystem';

export interface YoutubeCreatorActionBarProps {
  handle?: string;
  platform?: string;
  ctaText?: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  iconName?: string;
  position?: 'Center Stage' | 'Bottom Safe-Zone';
  isFree?: boolean;
  sfxType?: string;
  transitionStyle?: string;
  springPhysics?: string;
  motionBlur?: boolean;
  canvasBgColor?: string;
}

export const YoutubeCreatorActionBar: React.FC<YoutubeCreatorActionBarProps> = ({
  handle = '@alexandervance',
  platform = 'youtube',
  ctaText = 'SUBSCRIBE FOR WEEKLY DROPS',
  primaryColor = '#ef4444',
  accentColor = '#f59e0b',
  fontFamily = 'Outfit, Plus Jakarta Sans, system-ui, sans-serif',
  iconName,
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

  const springConfig = resolveSpringPhysics(springPhysics);
  const barSpring = spring({
    frame,
    fps,
    config: springConfig,
  });

  // Exit animation in the final 20 frames
  const exitStart = Math.max(0, durationInFrames - 20);
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const { transform, opacity, clipPath } = computeTransitionTransform({
    style: transitionStyle,
    entrance: barSpring,
    exitProgress,
    scale,
    isFree,
  });

  // Cursor glide-in animation (frames 14 to 36)
  const cursorProgress = interpolate(frame, [14, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cursorX = interpolate(cursorProgress, [0, 1], [120 * scale, 0]);
  const cursorY = interpolate(cursorProgress, [0, 1], [100 * scale, 0]);
  const cursorOpacity = interpolate(frame, [14, 20, 50, 60], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Click event triggers at frame 36
  const isClicked = frame >= 36;
  const clickScale = interpolate(frame, [36, 40, 46], [1, 0.88, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Particle ring burst on click (frames 36 to 54)
  const burstRadius = interpolate(frame, [36, 52], [0, 48 * scale], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const burstOpacity = interpolate(frame, [36, 42, 54], [0, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Ringing bell shake animation (frames 38 to 65)
  const bellDamping = Math.max(0, 1 - (frame - 38) / 25);
  const bellShake = frame >= 38 ? Math.sin((frame - 38) * 1.8) * 22 * bellDamping : 0;

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
            transform,
            opacity,
            clipPath,
            display: 'flex',
            alignItems: 'center',
            gap: `${20 * scale}px`,
            backgroundColor: 'rgba(10, 11, 16, 0.92)',
            backdropFilter: 'blur(30px)',
            borderRadius: `${26 * scale}px`,
            padding: `${16 * scale}px ${26 * scale}px`,
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: `0 30px 70px rgba(0, 0, 0, 0.85), 0 0 35px ${primaryColor}30`,
            position: 'relative',
          }}
        >
          {/* Avatar Ring */}
          <div
            style={{
              width: `${56 * scale}px`,
              height: `${56 * scale}px`,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
              padding: `${2.5 * scale}px`,
              flexShrink: 0,
              boxShadow: `0 4px 16px ${primaryColor}50`,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: '#0c0d12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: `${22 * scale}px`,
              }}
            >
              {iconName && !isFree ? (
                <Icon icon={iconName} width={`${26 * scale}px`} height={`${26 * scale}px`} />
              ) : (
                handle.replace('@', '')[0]?.toUpperCase() || 'A'
              )}
            </div>
          </div>

          {/* Channel Name & Callout Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${3 * scale}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${8 * scale}px` }}>
              <span
                style={{
                  fontSize: `${Math.round(22 * scale)}px`,
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                }}
              >
                {handle}
              </span>
              <span
                style={{
                  width: `${16 * scale}px`,
                  height: `${16 * scale}px`,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width={`${10 * scale}px`}
                  height={`${10 * scale}px`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            </div>

            <span
              style={{
                fontSize: `${Math.round(12 * scale)}px`,
                fontWeight: 600,
                color: '#94a3b8',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {ctaText}
            </span>
          </div>

          {/* Interactive Subscribe Button with Tactile Press & Particles */}
          <div style={{ position: 'relative' }}>
            {/* Click Particle Ring */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: `${burstRadius * 2}px`,
                height: `${burstRadius * 2}px`,
                borderRadius: '50%',
                border: `2px solid ${primaryColor}`,
                transform: 'translate(-50%, -50%)',
                opacity: burstOpacity,
                pointerEvents: 'none',
              }}
            />

            <button
              type="button"
              style={{
                transform: `scale(${clickScale})`,
                backgroundColor: isClicked ? '#27272a' : primaryColor,
                color: '#ffffff',
                border: isClicked ? '1px solid rgba(255,255,255,0.15)' : 'none',
                borderRadius: `${9999 * scale}px`,
                padding: `${12 * scale}px ${26 * scale}px`,
                fontSize: `${Math.round(14 * scale)}px`,
                fontWeight: 800,
                letterSpacing: '0.02em',
                boxShadow: isClicked ? 'none' : `0 8px 24px ${primaryColor}60`,
                display: 'flex',
                alignItems: 'center',
                gap: `${8 * scale}px`,
                cursor: 'pointer',
                transition: 'background-color 0.15s, transform 0.08s',
              }}
            >
              {isClicked ? (
                <>
                  <svg
                    width={`${14 * scale}px`}
                    height={`${14 * scale}px`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>SUBSCRIBED</span>
                </>
              ) : (
                <span>SUBSCRIBE</span>
              )}
            </button>

            {/* Vector Animated Pointer Cursor */}
            <div
              style={{
                position: 'absolute',
                top: `${26 * scale}px`,
                left: `${70 * scale}px`,
                transform: `translate(${cursorX}px, ${cursorY}px)`,
                opacity: cursorOpacity,
                pointerEvents: 'none',
                zIndex: 10,
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
              }}
            >
              <svg width={`${24 * scale}px`} height={`${24 * scale}px`} viewBox="0 0 24 24" fill="none">
                <path
                  d="M4.5 3.5L10.5 20.5L13.5 13.5L20.5 10.5L4.5 3.5Z"
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Ringing Bell Icon */}
          <div
            style={{
              transform: `rotate(${bellShake}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: `${44 * scale}px`,
              height: `${44 * scale}px`,
              borderRadius: '50%',
              backgroundColor: isClicked ? `${accentColor}25` : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${isClicked ? accentColor : 'rgba(255,255,255,0.1)'}`,
              color: isClicked ? accentColor : '#a1a1aa',
              flexShrink: 0,
              boxShadow: isClicked ? `0 0 15px ${accentColor}40` : undefined,
            }}
          >
            <svg
              width={`${22 * scale}px`}
              height={`${22 * scale}px`}
              viewBox="0 0 24 24"
              fill={isClicked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
