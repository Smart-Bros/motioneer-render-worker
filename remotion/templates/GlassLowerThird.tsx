import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export interface GlassLowerThirdProps {
  name?: string;
  role?: string;
  company?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export const GlassLowerThird: React.FC<GlassLowerThirdProps> = ({
  name = 'ALEXANDER VANCE',
  role = 'Head of Creative Engineering',
  company = 'Synthetix Media Group',
  primaryColor = '#6366f1',
  secondaryColor = '#38bdf8',
  fontFamily = 'Inter, system-ui, sans-serif',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth slide-in spring
  const slideProgress = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 100,
      mass: 0.9,
    },
  });

  const translateX = interpolate(slideProgress, [0, 1], [-120, 0]);
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const badgeScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        padding: '90px 100px',
        backgroundColor: 'transparent',
        fontFamily,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          transform: `translateX(${translateX}px)`,
          opacity,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Top Tagline / Company Pill */}
        <div
          style={{
            alignSelf: 'flex-start',
            transform: `scale(${Math.max(0, badgeScale)})`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(24, 24, 27, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 9999,
            padding: '6px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              boxShadow: `0 0 10px ${secondaryColor}`,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#f4f4f5',
            }}
          >
            {company}
          </span>
        </div>

        {/* Main Glass Card */}
        <div
          style={{
            backgroundColor: 'rgba(9, 9, 11, 0.82)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: 16,
            padding: '24px 32px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 460,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Accent Line Header */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, transparent)`,
            }}
          />

          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {name}
          </h2>

          <p
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.75)',
              margin: '6px 0 0 0',
              letterSpacing: '0.01em',
            }}
          >
            {role}
          </p>
        </div>
      </div>
    </div>
  );
};
