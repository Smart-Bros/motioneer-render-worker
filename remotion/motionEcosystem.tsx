import React from 'react';
import { Audio, Sequence, interpolate } from 'remotion';
import { whoosh, whip, mouseClick, shutterModern, pageTurn, ding } from '@remotion/sfx';
import { Trail } from '@remotion/motion-blur';

export const SFX_LIBRARY: Record<string, string> = {
  whoosh,
  whip,
  mouseClick,
  click: mouseClick,
  shutterModern,
  shutter: shutterModern,
  pageTurn,
  pageturn: pageTurn,
  pop: ding,
};

export function resolveSfxUrl(sfxType?: string, isFree?: boolean): string | null {
  if (isFree || !sfxType || sfxType === 'none') return null;
  return SFX_LIBRARY[sfxType] || null;
}

export function resolveSpringPhysics(preset?: string) {
  switch (preset) {
    case 'snappy':
      return { damping: 14, stiffness: 220, mass: 0.8 };
    case 'elastic':
      return { damping: 9, stiffness: 180, mass: 0.8 };
    case 'editorial':
    default:
      return { damping: 20, stiffness: 120, mass: 1 };
  }
}

export const SfxTrigger: React.FC<{
  sfxUrl: string | null;
  durationInFrames: number;
}> = ({ sfxUrl, durationInFrames }) => {
  if (!sfxUrl) return null;
  const exitFrame = Math.max(0, durationInFrames - 20);
  return (
    <>
      <Audio src={sfxUrl} volume={0.6} startFrom={0} />
      {exitFrame > 20 && (
        <Sequence from={exitFrame}>
          <Audio src={sfxUrl} volume={0.6} startFrom={0} />
        </Sequence>
      )}
    </>
  );
};

export const TemplatePositionContext = React.createContext<string>('center');

export const MotionBlurWrapper: React.FC<{
  enabled?: boolean;
  isFree?: boolean;
  position?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ enabled, isFree, position, style, children }) => {
  const ctxPosition = React.useContext(TemplatePositionContext);
  const activePosition = position || ctxPosition;
  const wrapperPos = resolveTemplateWrapperPosition(activePosition);
  const combinedStyle = { ...wrapperPos, ...style };

  if (enabled && !isFree) {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Trail layers={4} lagInFrames={0.5} trailOpacity={0.65}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              pointerEvents: 'auto',
              ...combinedStyle,
            }}
          >
            {children}
          </div>
        </Trail>
      </div>
    );
  }
  return <>{children}</>;
};

export function computeTransitionTransform({
  style,
  entrance,
  exitProgress,
  scale,
  isFree,
}: {
  style?: string;
  entrance: number;
  exitProgress: number;
  scale: number;
  isFree?: boolean;
}) {
  const activeStyle = isFree ? 'fade' : style || 'fade';

  // Base entrance translation
  let translateY = interpolate(entrance, [0, 1], [40 * scale, 0]);
  let translateX = 0;
  let rotateX = 0;
  let opacity = interpolate(entrance, [0, 0.4], [0, 1]);
  let clipPath: string | undefined = undefined;

  // Exit interpolation
  const exitTranslateY = interpolate(exitProgress, [0, 1], [0, 30 * scale]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  translateY += exitTranslateY;
  opacity *= exitOpacity;

  if (activeStyle === 'slide') {
    // Pro Spring Slide
    translateY = interpolate(entrance, [0, 1], [80 * scale, 0]) + exitTranslateY;
    translateX = interpolate(entrance, [0, 1], [-40 * scale, 0]);
  } else if (activeStyle === 'wipe') {
    // Directional Wipe
    const wipePercent = interpolate(entrance, [0, 1], [100, 0]);
    clipPath = `inset(0 ${wipePercent}% 0 0)`;
  } else if (activeStyle === 'flip') {
    // 3D Perspective Flip
    rotateX = interpolate(entrance, [0, 1], [-90, 0]);
  } else if (activeStyle === 'clock' || activeStyle === 'clockWipe') {
    // Radial Clock Wipe simulation
    const clockAngle = interpolate(entrance, [0, 1], [0, 360]);
    clipPath = clockAngle >= 360 ? undefined : `circle(${clockAngle / 3.6}% at 50% 50%)`;
  }

  return {
    transform: `perspective(1000px) translateY(${translateY}px) translateX(${translateX}px) rotateX(${rotateX}deg)`,
    opacity,
    clipPath,
  };
}

export function resolveTemplateWrapperPosition(position?: string) {
  const norm = (position || 'center').toLowerCase().trim();
  if (norm === 'center' || norm === 'center stage') {
    return {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: 0,
    };
  }
  if (norm === 'bottom-left') {
    return {
      justifyContent: 'flex-end' as const,
      alignItems: 'flex-start' as const,
      padding: '7% 6%',
    };
  }
  if (norm === 'top-right') {
    return {
      justifyContent: 'flex-start' as const,
      alignItems: 'flex-end' as const,
      padding: '7% 6%',
    };
  }
  // 'bottom-center' | 'Bottom Safe-Zone'
  return {
    justifyContent: 'flex-end' as const,
    alignItems: 'center' as const,
    padding: '7% 6%',
  };
}
