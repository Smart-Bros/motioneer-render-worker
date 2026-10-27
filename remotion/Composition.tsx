import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export interface MotioneerProps {
  prompt?: string;
  tier?: 'free' | 'pro' | 'agency';
  clientName?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const MotioneerComposition: React.FC<MotioneerProps> = ({
  prompt = 'Elena Rostova • Head of AI Motion Graphics',
  tier = 'pro',
  clientName = 'Motioneer Studio',
  primaryColor = '#0f172a',
  secondaryColor = '#38bdf8',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(entrance, [0, 1], [60, 0]);
  const glowPulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.6, 1]);

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        padding: '80px',
        backgroundColor: 'transparent',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          backgroundColor: 'rgba(10, 10, 16, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 20,
          padding: '24px 36px',
          boxShadow: `0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 30px ${secondaryColor}25`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 960,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${secondaryColor}, #818cf8, transparent)`,
            opacity: glowPulse,
          }}
        />

        {/* Brand Tag Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: secondaryColor,
              boxShadow: `0 0 10px ${secondaryColor}`,
            }}
          />
          <span
            style={{
              color: secondaryColor,
              fontSize: 13,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            {clientName} • {tier.toUpperCase()} TIER
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            {tier === 'free' ? 'MP4 (H264)' : '4K ALPHA (WEBM)'}
          </span>
        </div>

        {/* Prompt Title */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
          }}
        >
          &ldquo;{prompt}&rdquo;
        </div>
      </div>
    </div>
  );
};
