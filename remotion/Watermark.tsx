import React from 'react';
import { useVideoConfig } from 'remotion';

export interface WatermarkProps {
  show?: boolean;
}

export const Watermark: React.FC<WatermarkProps> = ({ show = true }) => {
  const { width } = useVideoConfig();
  if (!show) return null;

  const scale = Math.max(0.6, width / 1920);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: `${Math.round(24 * scale)}px`,
        right: `${Math.round(32 * scale)}px`,
        display: 'flex',
        alignItems: 'center',
        gap: `${Math.round(6 * scale)}px`,
        padding: `${Math.round(6 * scale)}px ${Math.round(12 * scale)}px`,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(10px)',
        borderRadius: `${Math.round(8 * scale)}px`,
        border: '1px solid rgba(255, 255, 255, 0.14)',
        color: 'rgba(255, 255, 255, 0.75)',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: `${Math.max(11, Math.round(13 * scale))}px`,
        fontWeight: 600,
        letterSpacing: '0.04em',
        pointerEvents: 'none',
        zIndex: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <span
        style={{
          width: `${Math.round(7 * scale)}px`,
          height: `${Math.round(7 * scale)}px`,
          borderRadius: '50%',
          backgroundColor: '#6366f1',
          boxShadow: '0 0 8px #6366f1',
        }}
      />
      <span>Made with Motioneer</span>
    </div>
  );
};
