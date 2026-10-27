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

export interface BreakingTickerBarProps {
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

export const BreakingTickerBar: React.FC<BreakingTickerBarProps> = ({
  primaryText = 'GLOBAL MARKETS RALLY AS TECH INDEX BREAKS ALL-TIME HIGH',
  secondaryText = 'NASDAQ +2.4% • S&P 500 +1.8% • BITCOIN CROSSES $98,000 • SEMICONDUCTOR SURGE',
  badgeText = 'BREAKING NEWS',
  accentColor = '#ef4444',
  secondaryColor = '#f59e0b',
  fontFamily = 'Inter, -apple-system, sans-serif',
  position = 'bottom-center',
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
  const entrance = spring({
    frame,
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
    entrance,
    exitProgress,
    scale,
    isFree,
  });

  // Marquee scroll for ticker
  const tickerOffset = (frame * 3.5 * scale) % (width * 0.8);
  const sfxAudioUrl = resolveSfxUrl(sfxType, isFree);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: canvasBgColor || 'transparent',
        fontFamily,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <SfxTrigger sfxUrl={sfxAudioUrl} durationInFrames={durationInFrames} />

      <MotionBlurWrapper enabled={motionBlur} isFree={isFree}>
        {/* Full-Width Ticker Strap */}
        <div
          style={{
            transform,
            opacity,
            clipPath,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.9)',
          }}
        >
          {/* Main Headline Bar */}
          <div
            style={{
              backgroundColor: '#0c0d12',
              borderTop: `3px solid ${accentColor}`,
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              padding: `${12 * scale}px ${36 * scale}px`,
              display: 'flex',
              alignItems: 'center',
              gap: `${20 * scale}px`,
            }}
          >
            {/* Breaking Tag */}
            <div
              style={{
                backgroundColor: accentColor,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: `${13 * scale}px`,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: `${6 * scale}px ${14 * scale}px`,
                borderRadius: `${4 * scale}px`,
                flexShrink: 0,
              }}
            >
              {badgeText}
            </div>

            {/* Headline */}
            <div
              style={{
                color: '#ffffff',
                fontSize: `${22 * scale}px`,
                fontWeight: 800,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {primaryText}
            </div>
          </div>

          {/* Live Marquee Sub-Bar */}
          <div
            style={{
              backgroundColor: '#16171f',
              padding: `${8 * scale}px 0`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: `${40 * scale}px`,
                transform: `translateX(-${tickerOffset}px)`,
                whiteSpace: 'nowrap',
                fontSize: `${13 * scale}px`,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: '#e2e8f0',
              }}
            >
              <span>{secondaryText}</span>
              <span style={{ color: secondaryColor }}>●</span>
              <span>{secondaryText}</span>
              <span style={{ color: secondaryColor }}>●</span>
              <span>{secondaryText}</span>
            </div>
          </div>
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
