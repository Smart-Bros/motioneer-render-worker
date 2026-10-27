import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export interface BasicTitleProps {
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

export const BasicTitle: React.FC<BasicTitleProps> = ({
  title = 'Minimalist Cinematic Title',
  subtitle = 'Crafted with precision in Motioneer Studio',
  backgroundColor = '#09090b',
  textColor = '#ffffff',
  accentColor = '#60a5fa',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation
  const progress = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 90,
      mass: 0.8,
    },
  });

  // Fade in text opacity
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Vertical drift
  const translateY = interpolate(progress, [0, 1], [40, 0]);

  // Subtle line expand
  const lineWidth = interpolate(progress, [0, 1], [0, 120]);

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        padding: 40,
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: accentColor,
            borderRadius: 2,
            marginBottom: 24,
          }}
        />

        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: textColor,
            letterSpacing: '-0.025em',
            margin: 0,
            textShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.7)',
            marginTop: 16,
            letterSpacing: '0.01em',
            maxWidth: 800,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
};
