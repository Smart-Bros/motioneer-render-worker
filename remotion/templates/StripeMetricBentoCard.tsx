import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { Icon } from '@iconify/react';
import { Watermark } from '../Watermark';
import {
  resolveSfxUrl,
  resolveSpringPhysics,
  SfxTrigger,
  MotionBlurWrapper,
  computeTransitionTransform,
} from '../motionEcosystem';

export interface StripeMetricBentoCardProps {
  label?: string;
  targetValue?: number;
  prefix?: string;
  suffix?: string;
  trendText?: string;
  isPositive?: boolean;
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

export const StripeMetricBentoCard: React.FC<StripeMetricBentoCardProps> = ({
  label = 'GROWTH METRIC',
  targetValue = 384,
  prefix = '+',
  suffix = '%',
  trendText = '+48.2% vs Previous Quarter',
  isPositive = true,
  primaryColor = '#10b981',
  accentColor = '#3b82f6',
  fontFamily = 'Cabinet Grotesk, Plus Jakarta Sans, system-ui, sans-serif',
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

  const scale = Math.min(width, height) / 1080;
  const isSafeZone = position === 'Bottom Safe-Zone';

  const springConfig = resolveSpringPhysics(springPhysics);
  const cardSpring = spring({
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
    entrance: cardSpring,
    exitProgress,
    scale,
    isFree,
  });

  // Animated counting number: 0 -> targetValue over frames 8 to 48
  const countProgress = interpolate(frame, [8, 48], [0, targetValue], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const displayedNumber = Math.round(countProgress).toLocaleString();

  // Badge pop spring
  const badgeSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 12, stiffness: 160 },
  });

  // Evolving SVG path using @remotion/paths
  const sparklineD = 'M 0 55 C 40 50, 70 38, 110 32 C 150 26, 180 34, 220 18 C 250 8, 270 12, 280 6';
  const pathEvolutionProgress = interpolate(frame, [12, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const evolved = evolvePath(pathEvolutionProgress, sparklineD);

  const areaOpacity = interpolate(frame, [24, 52], [0, 0.25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
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

      <MotionBlurWrapper enabled={motionBlur} isFree={isFree} position={position}>
        <div
          style={{
            transform,
            opacity,
            clipPath,
            backgroundColor: 'rgba(11, 13, 19, 0.92)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: `${26 * scale}px`,
            padding: `${26 * scale}px ${36 * scale}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${14 * scale}px`,
            boxShadow: `0 35px 80px rgba(0, 0, 0, 0.9), 0 0 45px ${primaryColor}25`,
            position: 'relative',
            overflow: 'hidden',
            minWidth: `${380 * scale}px`,
            maxWidth: '92%',
          }}
        >
          {/* Top Accent Gradient Bar with Light Sweep */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: `${4 * scale}px`,
              background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
            }}
          />

          {/* Header: Metric Label & Trend Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: `${16 * scale}px`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: `${8 * scale}px` }}>
              {iconName && (
                <Icon
                  icon={iconName}
                  style={{
                    width: `${16 * scale}px`,
                    height: `${16 * scale}px`,
                    color: primaryColor,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: `${Math.round(13 * scale)}px`,
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#a1a1aa',
                }}
              >
                {label}
              </span>
            </div>

            <span
              style={{
                transform: `scale(${Math.max(0, badgeSpring)})`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: `${6 * scale}px`,
                backgroundColor: `${primaryColor}20`,
                border: `1px solid ${primaryColor}70`,
                color: primaryColor,
                borderRadius: '9999px',
                padding: `${4 * scale}px ${12 * scale}px`,
                fontSize: `${Math.round(11 * scale)}px`,
                fontWeight: 800,
                letterSpacing: '0.05em',
                boxShadow: `0 0 15px ${primaryColor}40`,
              }}
            >
              <span>{isPositive ? 'GROWTH' : 'METRIC'}</span>
            </span>
          </div>

          {/* Counter Big Stat */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: `${4 * scale}px`,
              color: '#ffffff',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            <span
              style={{
                fontSize: `${Math.round(64 * scale)}px`,
                fontWeight: 950,
                color: '#ffffff',
                fontVariantNumeric: 'tabular-nums',
                textShadow: `0 4px 20px rgba(0,0,0,0.8), 0 0 30px ${primaryColor}30`,
              }}
            >
              {prefix}
              {displayedNumber}
              {suffix}
            </span>
          </div>

          {/* Live Drawing SVG Sparkline Chart via @remotion/paths evolvePath */}
          <div
            style={{
              width: '100%',
              height: `${56 * scale}px`,
              position: 'relative',
              marginTop: `${2 * scale}px`,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 280 60"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={primaryColor} stopOpacity={areaOpacity} />
                  <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Gradient Area Fill */}
              <path
                d="M 0 55 C 40 50, 70 38, 110 32 C 150 26, 180 34, 220 18 C 250 8, 270 12, 280 6 L 280 60 L 0 60 Z"
                fill="url(#metricGradient)"
              />

              {/* Main Sparkline Stroke using evolved path strokeDasharray/strokeDashoffset */}
              <path
                d={sparklineD}
                stroke={primaryColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={evolved.strokeDasharray}
                strokeDashoffset={evolved.strokeDashoffset}
                style={{ filter: `drop-shadow(0 0 8px ${primaryColor})` }}
              />
            </svg>
          </div>

          {/* Sub-Metric Trend Line */}
          {trendText && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${8 * scale}px`,
                fontSize: `${Math.round(14 * scale)}px`,
                fontWeight: 600,
                color: primaryColor,
                paddingTop: `${2 * scale}px`,
              }}
            >
              <svg
                width={`${16 * scale}px`}
                height={`${16 * scale}px`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span>{trendText}</span>
            </div>
          )}
        </div>
      </MotionBlurWrapper>

      <Watermark show={isFree} />
    </AbsoluteFill>
  );
};
