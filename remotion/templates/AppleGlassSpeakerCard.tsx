import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Icon } from '@iconify/react';
import { Watermark } from '../Watermark';

export interface AppleGlassSpeakerCardProps {
  name?: string;
  role?: string;
  company?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  iconName?: string;
  position?: 'Center Stage' | 'Bottom Safe-Zone';
  isFree?: boolean;
}

export const AppleGlassSpeakerCard: React.FC<AppleGlassSpeakerCardProps> = ({
  name = 'ALEXANDER VANCE',
  role = 'Head of Creative Engineering',
  company = 'Synthetix Media Group',
  primaryColor = '#6366f1',
  secondaryColor = '#38bdf8',
  fontFamily = 'Inter, system-ui, sans-serif',
  iconName,
  position = 'Center Stage',
  isFree = false,
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
  const exitTranslateY = interpolate(exitProgress, [0, 1], [0, 40 * scale]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Entrance spring physics
  // 1. Floating pill tag above (frames 0-14)
  const tagSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // 2. Avatar / Icon badge scales in first (frames 4-18)
  const avatarSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  // 3. Main frosted glass card slides & fades in (frames 6-22)
  const cardSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const cardTranslateY = interpolate(cardSpring, [0, 1], [40 * scale, 0]);

  // 4. Staggered clip-path text reveals
  const nameSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 13, stiffness: 130 },
  });
  const nameTranslateY = interpolate(nameSpring, [0, 1], [30 * scale, 0]);
  const nameOpacity = interpolate(frame, [10, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const roleSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 13, stiffness: 130 },
  });
  const roleTranslateY = interpolate(roleSpring, [0, 1], [25 * scale, 0]);
  const roleOpacity = interpolate(frame, [15, 27], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Rotating conic-gradient border beam angle
  const beamAngle = (frame * 4) % 360;

  // Initials for avatar
  const initials = name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((s) => s.charAt(0))
    .join('')
    .toUpperCase() || 'AV';

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
        backgroundColor: 'transparent',
        fontFamily,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${12 * scale}px`,
          maxWidth: '92%',
          transform: `translateY(${exitTranslateY}px)`,
          opacity: exitOpacity,
        }}
      >
        {/* Subtle Floating Pill Tag Above */}
        {company && (
          <div
            style={{
              transform: `scale(${Math.max(0, tagSpring)})`,
              transformOrigin: 'center center',
              display: 'flex',
              alignItems: 'center',
              gap: `${8 * scale}px`,
              backgroundColor: 'rgba(15, 17, 23, 0.90)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '9999px',
              padding: `${7 * scale}px ${18 * scale}px`,
              boxShadow: `0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px ${secondaryColor}25`,
            }}
          >
            <span
              style={{
                width: `${8 * scale}px`,
                height: `${8 * scale}px`,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})`,
                boxShadow: `0 0 10px ${secondaryColor}`,
              }}
            />
            <span
              style={{
                fontSize: `${Math.round(13 * scale)}px`,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#f4f4f5',
              }}
            >
              {company}
            </span>
          </div>
        )}

        {/* Frosted Glass Pill Card with Rotating Conic-Gradient Border Beam */}
        <div
          style={{
            position: 'relative',
            borderRadius: `${24 * scale}px`,
            padding: `${2 * scale}px`,
            background: `conic-gradient(from ${beamAngle}deg at 50% 50%, ${secondaryColor}, ${primaryColor}, transparent 55%, ${secondaryColor})`,
            boxShadow: `0 30px 70px -10px rgba(0, 0, 0, 0.85), 0 0 35px ${secondaryColor}30`,
            transform: `translateY(${cardTranslateY}px)`,
            opacity: cardSpring,
            maxWidth: '100%',
          }}
        >
          {/* Card Inner Body */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${22 * scale}px`,
              backgroundColor: 'rgba(10, 11, 16, 0.88)',
              backdropFilter: 'blur(32px)',
              borderRadius: `${22 * scale}px`,
              padding: `${20 * scale}px ${34 * scale}px`,
              overflow: 'hidden',
            }}
          >
            {/* Animated Avatar / Icon Badge that scales in first */}
            <div
              style={{
                transform: `scale(${Math.max(0, avatarSpring)})`,
                width: `${64 * scale}px`,
                height: `${64 * scale}px`,
                borderRadius: `${18 * scale}px`,
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 10px 25px ${primaryColor}60`,
                flexShrink: 0,
                color: '#ffffff',
                fontWeight: 800,
                fontSize: `${22 * scale}px`,
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              {iconName ? (
                <Icon
                  icon={iconName}
                  style={{
                    width: `${34 * scale}px`,
                    height: `${34 * scale}px`,
                    color: '#ffffff',
                  }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Clip-Path Staggered Title & Role Reveal */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${6 * scale}px`,
                overflow: 'hidden',
              }}
            >
              {/* Primary Name */}
              <div style={{ overflow: 'hidden', maxWidth: `${Math.round((width * 0.8) - 130 * scale)}px` }}>
                <div
                  style={{
                    transform: `translateY(${nameTranslateY}px)`,
                    opacity: nameOpacity,
                    fontSize: `${Math.round(42 * scale)}px`,
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {name}
                </div>
              </div>

              {/* Subtitle / Role */}
              <div style={{ overflow: 'hidden', maxWidth: `${Math.round((width * 0.8) - 130 * scale)}px` }}>
                <div
                  style={{
                    transform: `translateY(${roleTranslateY}px)`,
                    opacity: roleOpacity,
                    fontSize: `${Math.round(20 * scale)}px`,
                    fontWeight: 500,
                    color: '#a1a1aa',
                    letterSpacing: '0.01em',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
