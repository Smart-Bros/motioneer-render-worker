import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';

export type EnterAnimationType =
  | 'spring-up'
  | 'scale-pop'
  | 'wipe-right'
  | 'typewriter'
  | '3d-flip'
  | 'orbit';

export type LayerType =
  | 'KineticTextLayer'
  | 'AnimatedShapeLayer'
  | 'SvgPathLayer'
  | 'GlassBentoLayer'
  | 'MetricCounterLayer'
  | 'ProgressRingLayer'
  | 'RadarHudLayer'
  | 'GridBackgroundLayer';

export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
}

export interface MotionLayer {
  id: string;
  type: LayerType;
  name: string;
  startFrame: number;
  durationInFrames: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
  color: string;
  enterAnimation: EnterAnimationType;
  springConfig: SpringConfig;
  props: Record<string, any>;
}

export interface CustomProceduralCompositionProps {
  sceneTitle?: string;
  backgroundColor?: string;
  layers?: MotionLayer[];
}

export const DEFAULT_PROCEDURAL_LAYERS: MotionLayer[] = [
  {
    id: 'layer-grid',
    type: 'GridBackgroundLayer',
    name: 'Cyberpunk Grid',
    startFrame: 0,
    durationInFrames: 180,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    color: '#38bdf8',
    enterAnimation: 'scale-pop',
    springConfig: { damping: 15, stiffness: 80, mass: 1 },
    props: {
      gridSize: 48,
      opacity: 0.15,
      perspective: 60,
    },
  },
  {
    id: 'layer-bento',
    type: 'GlassBentoLayer',
    name: 'Hero Bento Card',
    startFrame: 5,
    durationInFrames: 175,
    x: 50,
    y: 50,
    scale: 1,
    rotation: 0,
    color: '#00f0ff',
    enterAnimation: 'spring-up',
    springConfig: { damping: 14, stiffness: 120, mass: 0.8 },
    props: {
      width: 720,
      height: 380,
      backdropBlur: 24,
      borderRadius: 24,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      backgroundColor: 'rgba(10, 10, 16, 0.85)',
      glowColor: 'rgba(0, 240, 255, 0.25)',
    },
  },
  {
    id: 'layer-badge',
    type: 'KineticTextLayer',
    name: 'Telemetry Badge',
    startFrame: 12,
    durationInFrames: 168,
    x: 50,
    y: 38,
    scale: 1,
    rotation: 0,
    color: '#00f0ff',
    enterAnimation: 'wipe-right',
    springConfig: { damping: 12, stiffness: 150, mass: 0.7 },
    props: {
      text: 'AI MOTION DIRECTOR • SYSTEM ACTIVE',
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: '0.2em',
      fontFamily: 'monospace',
    },
  },
  {
    id: 'layer-headline',
    type: 'KineticTextLayer',
    name: 'Headline',
    startFrame: 16,
    durationInFrames: 164,
    x: 50,
    y: 47,
    scale: 1,
    rotation: 0,
    color: '#ffffff',
    enterAnimation: 'spring-up',
    springConfig: { damping: 13, stiffness: 130, mass: 0.8 },
    props: {
      text: 'Next-Gen Motion Synthesis',
      fontSize: 44,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  },
  {
    id: 'layer-metric',
    type: 'MetricCounterLayer',
    name: 'Growth Counter',
    startFrame: 22,
    durationInFrames: 158,
    x: 35,
    y: 60,
    scale: 1,
    rotation: 0,
    color: '#10b981',
    enterAnimation: 'scale-pop',
    springConfig: { damping: 14, stiffness: 120, mass: 0.8 },
    props: {
      targetValue: 840,
      prefix: '+',
      suffix: '%',
      label: 'ENGAGEMENT VELOCITY',
      duration: 45,
    },
  },
  {
    id: 'layer-progress',
    type: 'ProgressRingLayer',
    name: 'Efficiency Ring',
    startFrame: 26,
    durationInFrames: 154,
    x: 65,
    y: 60,
    scale: 1,
    rotation: 0,
    color: '#38bdf8',
    enterAnimation: '3d-flip',
    springConfig: { damping: 12, stiffness: 140, mass: 0.7 },
    props: {
      radius: 42,
      strokeWidth: 7,
      percentage: 94,
      trackColor: 'rgba(255, 255, 255, 0.08)',
      showLabel: true,
      label: 'RENDER SPEED',
    },
  },
  {
    id: 'layer-radar',
    type: 'RadarHudLayer',
    name: 'Corner HUD Telemetry',
    startFrame: 10,
    durationInFrames: 170,
    x: 88,
    y: 18,
    scale: 0.85,
    rotation: 0,
    color: '#00f0ff',
    enterAnimation: 'orbit',
    springConfig: { damping: 14, stiffness: 100, mass: 1 },
    props: {
      size: 90,
      ringCount: 3,
      sweepSpeed: 1.5,
      telemetryText: 'NODE_01 // 60FPS',
    },
  },
];

// Helper to compute enter animation transforms
function useLayerAnimation(
  layer: MotionLayer,
  frame: number,
  fps: number
): { opacity: number; transform: string } {
  const localFrame = Math.max(0, frame - layer.startFrame);
  const spr = spring({
    frame: localFrame,
    fps,
    config: {
      damping: layer.springConfig.damping || 14,
      stiffness: layer.springConfig.stiffness || 120,
      mass: layer.springConfig.mass || 0.8,
    },
  });

  const baseScale = layer.scale ?? 1;
  const baseRotation = layer.rotation ?? 0;

  switch (layer.enterAnimation) {
    case 'spring-up': {
      const translateY = interpolate(spr, [0, 1], [60, 0]);
      return {
        opacity: interpolate(spr, [0, 0.3, 1], [0, 0.8, 1]),
        transform: `translate3d(0, ${translateY}px, 0) scale(${baseScale * spr}) rotate(${baseRotation}deg)`,
      };
    }
    case 'scale-pop': {
      const currentScale = interpolate(spr, [0, 1], [0.2, baseScale]);
      return {
        opacity: interpolate(spr, [0, 0.4, 1], [0, 0.9, 1]),
        transform: `scale(${currentScale}) rotate(${baseRotation}deg)`,
      };
    }
    case 'wipe-right': {
      const translateX = interpolate(spr, [0, 1], [-80, 0]);
      return {
        opacity: interpolate(spr, [0, 0.4, 1], [0, 0.9, 1]),
        transform: `translate3d(${translateX}px, 0, 0) scale(${baseScale}) rotate(${baseRotation}deg)`,
      };
    }
    case 'typewriter': {
      return {
        opacity: interpolate(spr, [0, 0.2, 1], [0, 1, 1]),
        transform: `scale(${baseScale}) rotate(${baseRotation}deg)`,
      };
    }
    case '3d-flip': {
      const rotateX = interpolate(spr, [0, 1], [90, 0]);
      return {
        opacity: interpolate(spr, [0, 0.3, 1], [0, 1, 1]),
        transform: `perspective(800px) rotateX(${rotateX}deg) scale(${baseScale}) rotate(${baseRotation}deg)`,
      };
    }
    case 'orbit': {
      const orbitRot = interpolate(spr, [0, 1], [-180, baseRotation]);
      const currentScale = interpolate(spr, [0, 1], [0.3, baseScale]);
      return {
        opacity: interpolate(spr, [0, 0.3, 1], [0, 1, 1]),
        transform: `rotate(${orbitRot}deg) scale(${currentScale})`,
      };
    }
    default: {
      return {
        opacity: spr,
        transform: `scale(${baseScale}) rotate(${baseRotation}deg)`,
      };
    }
  }
}

// 1. Kinetic Text Layer
const KineticTextView: React.FC<{ layer: MotionLayer; frame: number; fps: number }> = ({
  layer,
  frame,
  fps,
}) => {
  const { props } = layer;
  const localFrame = Math.max(0, frame - layer.startFrame);
  const text = props.text || 'Motion Kinetic';
  const fontSize = props.fontSize || 32;
  const fontWeight = props.fontWeight || 700;
  const fontFamily = props.fontFamily || 'Inter, sans-serif';
  const letterSpacing = props.letterSpacing || 'normal';

  // Typewriter effect if configured
  let displayedText = text;
  if (layer.enterAnimation === 'typewriter') {
    const endFrame = Math.max(1, Math.min(30, text.length * 2));
    const charsToShow = Math.floor(
      (interpolate(localFrame, [0, endFrame], [0, text.length], {
        extrapolateRight: 'clamp',
      }) as unknown as number)
    );
    displayedText = text.slice(0, charsToShow);
  }

  return (
    <div
      style={{
        color: layer.color || '#ffffff',
        fontSize: `${fontSize}px`,
        fontWeight,
        fontFamily,
        letterSpacing,
        textShadow: `0 0 20px ${layer.color}40`,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        userSelect: 'none',
      }}
    >
      {displayedText}
    </div>
  );
};

// 2. Animated Shape Layer
const AnimatedShapeView: React.FC<{ layer: MotionLayer; frame: number; fps: number }> = ({
  layer,
  frame,
}) => {
  const { props } = layer;
  const shapeType = props.shapeType || 'rectangle';
  const width = props.width || 120;
  const height = props.height || 120;
  const borderRadius = props.borderRadius ?? 16;
  const strokeWidth = props.strokeWidth || 2;
  const strokeColor = props.strokeColor || layer.color;
  const fillColor = props.fillColor || `${layer.color}20`;

  if (shapeType === 'circle') {
    return (
      <div
        style={{
          width: `${width}px`,
          height: `${width}px`,
          borderRadius: '50%',
          border: `${strokeWidth}px solid ${strokeColor}`,
          backgroundColor: fillColor,
          boxShadow: `0 0 30px ${layer.color}40`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        border: `${strokeWidth}px solid ${strokeColor}`,
        backgroundColor: fillColor,
        boxShadow: `0 0 30px ${layer.color}30`,
      }}
    />
  );
};

// 3. SVG Path Layer
const SvgPathView: React.FC<{ layer: MotionLayer; frame: number; fps: number }> = ({
  layer,
  frame,
  fps,
}) => {
  const { props } = layer;
  const localFrame = Math.max(0, frame - layer.startFrame);
  const pathData =
    props.pathData || 'M 10 80 Q 95 10 180 80 T 360 80';
  const strokeWidth = props.strokeWidth || 3;
  const strokeColor = props.strokeColor || layer.color;
  const width = props.width || 380;
  const height = props.height || 120;

  // Path dash draw animation
  const drawProgress = interpolate(localFrame, [0, 30], [1000, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={1000}
        strokeDashoffset={drawProgress}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 10px ${layer.color}80)`,
        }}
      />
    </svg>
  );
};

// 4. Glass Bento Layer
const GlassBentoView: React.FC<{ layer: MotionLayer; frame: number; fps: number }> = ({
  layer,
  frame,
}) => {
  const { props } = layer;
  const width = props.width || 640;
  const height = props.height || 340;
  const borderRadius = props.borderRadius ?? 24;
  const backdropBlur = props.backdropBlur ?? 24;
  const backgroundColor = props.backgroundColor || 'rgba(10, 10, 16, 0.88)';
  const borderColor = props.borderColor || 'rgba(255, 255, 255, 0.12)';
  const glowColor = props.glowColor || `${layer.color}30`;

  const glowPulse = interpolate(Math.sin((frame + layer.startFrame) / 10), [-1, 1], [0.7, 1]);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        backdropFilter: `blur(${backdropBlur}px)`,
        WebkitBackdropFilter: `blur(${backdropBlur}px)`,
        backgroundColor,
        border: `1px solid ${borderColor}`,
        boxShadow: `0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px ${glowColor}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent light rail */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${layer.color}, transparent)`,
          opacity: glowPulse,
        }}
      />
    </div>
  );
};

// 5. Metric Counter Layer
const MetricCounterView: React.FC<{ layer: MotionLayer; frame: number; fps: number }> = ({
  layer,
  frame,
}) => {
  const { props } = layer;
  const localFrame = Math.max(0, frame - layer.startFrame);
  const targetValue = props.targetValue ?? 100;
  const duration = props.duration || 35;
  const prefix = props.prefix || '';
  const suffix = props.suffix || '';
  const label = props.label || 'METRIC';

  const currentValue = Math.floor(
    interpolate(localFrame, [0, duration], [0, targetValue], {
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad),
    })
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: '48px',
          fontWeight: 900,
          color: layer.color || '#10b981',
          letterSpacing: '-0.03em',
          textShadow: `0 0 25px ${layer.color}50`,
          lineHeight: 1,
        }}
      >
        {prefix}
        {currentValue.toLocaleString()}
        {suffix}
      </div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: '0.15em',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  );
};

// 6. Progress Ring Layer
const ProgressRingView: React.FC<{ layer: MotionLayer; frame: number; fps: number }> = ({
  layer,
  frame,
}) => {
  const { props } = layer;
  const localFrame = Math.max(0, frame - layer.startFrame);
  const radius = props.radius || 40;
  const strokeWidth = props.strokeWidth || 6;
  const percentage = props.percentage ?? 80;
  const showLabel = props.showLabel ?? true;
  const label = props.label || '';

  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const currentPercent = interpolate(localFrame, [0, 40], [0, percentage], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const strokeDashoffset = circumference - (currentPercent / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            stroke={props.trackColor || 'rgba(255, 255, 255, 0.1)'}
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={layer.color || '#38bdf8'}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: `${radius * 0.4}px`,
            fontWeight: 800,
            fontFamily: 'monospace',
          }}
        >
          {Math.round(currentPercent)}%
        </div>
      </div>
      {showLabel && label && (
        <span
          style={{
            fontSize: '10px',
            fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.12em',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

// 7. Radar HUD Layer
const RadarHudView: React.FC<{ layer: MotionLayer; frame: number; fps: number }> = ({
  layer,
  frame,
}) => {
  const { props } = layer;
  const size = props.size || 100;
  const ringCount = props.ringCount || 3;
  const sweepSpeed = props.sweepSpeed || 1;
  const telemetryText = props.telemetryText || 'SYS_OK';

  const sweepAngle = (frame * sweepSpeed * 4) % 360;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Concentric rings */}
      {Array.from({ length: ringCount }).map((_, idx) => {
        const ringSize = (size / ringCount) * (idx + 1);
        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              width: `${ringSize}px`,
              height: `${ringSize}px`,
              borderRadius: '50%',
              border: `1px solid ${layer.color}35`,
            }}
          />
        );
      })}

      {/* Crosshair lines */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: 1,
          backgroundColor: `${layer.color}40`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          height: '100%',
          width: 1,
          backgroundColor: `${layer.color}40`,
        }}
      />

      {/* Rotating sweep cone */}
      <div
        style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: `conic-gradient(from ${sweepAngle}deg at 50% 50%, ${layer.color}60 0deg, transparent 60deg)`,
          opacity: 0.8,
        }}
      />

      {/* Center blip */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: layer.color,
          boxShadow: `0 0 10px ${layer.color}`,
        }}
      />

      {/* Telemetry bottom text */}
      <div
        style={{
          position: 'absolute',
          bottom: -18,
          fontSize: 9,
          fontFamily: 'monospace',
          color: layer.color,
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
        }}
      >
        {telemetryText}
      </div>
    </div>
  );
};

// 8. Grid Background Layer
const GridBackgroundView: React.FC<{ layer: MotionLayer; frame: number; fps: number }> = ({
  layer,
  frame,
}) => {
  const { props } = layer;
  const gridSize = props.gridSize || 40;
  const opacity = props.opacity ?? 0.15;
  const perspective = props.perspective || 60;

  const pulse = interpolate(Math.sin(frame / 20), [-1, 1], [0.8, 1.2]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: opacity * pulse,
        perspective: `${perspective * 10}px`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(${layer.color} 1px, transparent 1px), linear-gradient(90deg, ${layer.color} 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
    </div>
  );
};

export const CustomProceduralComposition: React.FC<CustomProceduralCompositionProps> = ({
  sceneTitle = 'Generative Motion Lab',
  backgroundColor = 'transparent',
  layers = DEFAULT_PROCEDURAL_LAYERS,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {layers.map((layer) => {
        // Check if layer is active in current frame window
        if (frame < layer.startFrame || frame > layer.startFrame + layer.durationInFrames) {
          return null;
        }

        const anim = useLayerAnimation(layer, frame, fps);
        const leftPercent = layer.x ?? 50;
        const topPercent = layer.y ?? 50;

        let LayerComponent = null;
        switch (layer.type) {
          case 'KineticTextLayer':
            LayerComponent = <KineticTextView layer={layer} frame={frame} fps={fps} />;
            break;
          case 'AnimatedShapeLayer':
            LayerComponent = <AnimatedShapeView layer={layer} frame={frame} fps={fps} />;
            break;
          case 'SvgPathLayer':
            LayerComponent = <SvgPathView layer={layer} frame={frame} fps={fps} />;
            break;
          case 'GlassBentoLayer':
            LayerComponent = <GlassBentoView layer={layer} frame={frame} fps={fps} />;
            break;
          case 'MetricCounterLayer':
            LayerComponent = <MetricCounterView layer={layer} frame={frame} fps={fps} />;
            break;
          case 'ProgressRingLayer':
            LayerComponent = <ProgressRingView layer={layer} frame={frame} fps={fps} />;
            break;
          case 'RadarHudLayer':
            LayerComponent = <RadarHudView layer={layer} frame={frame} fps={fps} />;
            break;
          case 'GridBackgroundLayer':
            LayerComponent = <GridBackgroundView layer={layer} frame={frame} fps={fps} />;
            break;
          default:
            LayerComponent = null;
        }

        // For grid background, cover entire frame
        if (layer.type === 'GridBackgroundLayer') {
          return (
            <div
              key={layer.id}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: anim.opacity,
                transform: anim.transform,
              }}
            >
              {LayerComponent}
            </div>
          );
        }

        return (
          <div
            key={layer.id}
            style={{
              position: 'absolute',
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: `translate(-50%, -50%) ${anim.transform}`,
              opacity: anim.opacity,
              willChange: 'transform, opacity',
              pointerEvents: 'none',
            }}
          >
            {LayerComponent}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
