import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export interface KineticHookProps {
  phrase1?: string;
  phrase2?: string;
  hookWord?: string;
  primaryColor?: string;
  accentColor?: string;
}

export const KineticHook: React.FC<KineticHookProps> = ({
  phrase1 = 'STOP SCROLLING',
  phrase2 = 'AI WILL REPLACE YOUR',
  hookWord = 'AFTER EFFECTS',
  primaryColor = '#f43f5e',
  accentColor = '#facc15',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Aggressive pop springs
  const pop1 = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 220, mass: 0.5 },
  });

  const pop2 = spring({
    frame: frame - 12,
    fps,
    config: { damping: 9, stiffness: 220, mass: 0.5 },
  });

  const pop3 = spring({
    frame: frame - 24,
    fps,
    config: { damping: 8, stiffness: 250, mass: 0.4 },
  });

  const scale1 = interpolate(pop1, [0, 1], [0.4, 1]);
  const scale2 = interpolate(pop2, [0, 1], [0.4, 1]);
  const scale3 = interpolate(pop3, [0, 1], [0.2, 1.1]);

  const rotation = interpolate(pop3, [0, 1], [-6, -2]);

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
        backgroundColor: 'transparent',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: 40,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Phrase 1 */}
        {frame >= 0 && (
          <div
            style={{
              transform: `scale(${scale1})`,
              opacity: pop1,
              backgroundColor: '#09090b',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              padding: '12px 28px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 900,
                letterSpacing: '0.04em',
                color: '#ffffff',
                textTransform: 'uppercase',
              }}
            >
              {phrase1}
            </span>
          </div>
        )}

        {/* Phrase 2 */}
        {frame >= 12 && (
          <div
            style={{
              transform: `scale(${scale2})`,
              opacity: pop2,
            }}
          >
            <span
              style={{
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                textShadow: '0 4px 20px rgba(0,0,0,0.9)',
                textTransform: 'uppercase',
              }}
            >
              {phrase2}
            </span>
          </div>
        )}

        {/* Hook Word with heavy rotation & punchy color */}
        {frame >= 24 && (
          <div
            style={{
              transform: `scale(${scale3}) rotate(${rotation}deg)`,
              opacity: pop3,
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
              borderRadius: 16,
              padding: '16px 36px',
              boxShadow: `0 20px 60px ${primaryColor}80`,
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#000000',
                textTransform: 'uppercase',
              }}
            >
              {hookWord}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
