'use client';

import React from 'react';
import * as Remotion from 'remotion';
import * as RemotionSfx from '@remotion/sfx';
import * as RemotionTransitions from '@remotion/transitions';
import * as RemotionMotionBlur from '@remotion/motion-blur';
import * as RemotionShapes from '@remotion/shapes';
import * as RemotionPaths from '@remotion/paths';
import * as RemotionThree from '@remotion/three';
import * as Three from 'three';
import * as ReactThreeFiber from '@react-three/fiber';
import * as LucideIcons from 'lucide-react';
import { Icon } from '@iconify/react';
import { transform } from 'sucrase';

export interface CompilationResult {
  Component: React.ComponentType<any> | null;
  error: string | null;
}

// Sound effect lookup map for convenience if AI uses sound names as strings
const SFX_URLS: Record<string, string> = {
  whoosh: RemotionSfx.whoosh,
  whip: RemotionSfx.whip,
  click: RemotionSfx.mouseClick,
  mouseClick: RemotionSfx.mouseClick,
  shutter: RemotionSfx.shutterModern,
  shutterModern: RemotionSfx.shutterModern,
  pageTurn: RemotionSfx.pageTurn,
  ding: RemotionSfx.ding,
  pop: RemotionSfx.ding,
  snapchatNotification: RemotionSfx.snapchatNotification,
  uiSwitch: RemotionSfx.uiSwitch,
  recordScratch: RemotionSfx.recordScratch,
};

// Enhanced Remotion package with sound effects directly bound
const EnhancedRemotion = {
  ...Remotion,
  ...RemotionSfx,
  // Smart Audio component that resolves string sound names like src="whoosh"
  Audio: (props: any) => {
    let resolvedSrc = props.src;
    if (typeof resolvedSrc === 'string' && SFX_URLS[resolvedSrc]) {
      resolvedSrc = SFX_URLS[resolvedSrc];
    }
    return React.createElement(Remotion.Audio, { ...props, src: resolvedSrc });
  },
};

/**
 * Compiles raw TSX Remotion code on the fly in the browser
 * using Sucrase and binds standard Remotion / React hooks safely.
 */
export function compileRemotionComponent(sourceCode: string): CompilationResult {
  if (!sourceCode || !sourceCode.trim()) {
    return { Component: null, error: 'Empty TSX code provided.' };
  }

  try {
    // 1. Transpile TSX to executable JavaScript
    const transpiled = transform(sourceCode, {
      transforms: ['jsx', 'typescript', 'imports'],
      jsxRuntime: 'classic',
    });

    const exports: Record<string, any> = {};
    const module = { exports };

    // 2. Sandboxed require resolver supporting all official Remotion ecosystem libraries
    function customRequire(moduleName: string) {
      if (moduleName === 'react' || moduleName.startsWith('react/')) {
        return React;
      }
      if (moduleName === '@remotion/sfx') {
        return RemotionSfx;
      }
      if (moduleName === '@remotion/transitions') {
        return RemotionTransitions;
      }
      if (moduleName === '@remotion/motion-blur') {
        return RemotionMotionBlur;
      }
      if (moduleName === '@remotion/shapes') {
        return RemotionShapes;
      }
      if (moduleName === '@remotion/paths') {
        return RemotionPaths;
      }
      if (moduleName === '@remotion/three') {
        return RemotionThree;
      }
      if (moduleName === 'three') {
        return Three;
      }
      if (moduleName === '@react-three/fiber') {
        return ReactThreeFiber;
      }
      if (moduleName === 'remotion' || moduleName.startsWith('@remotion/')) {
        return EnhancedRemotion;
      }
      if (moduleName === 'lucide-react') {
        return LucideIcons;
      }
      if (moduleName === '@iconify/react') {
        return { Icon, default: Icon };
      }
      // Return empty object for unrecognized modules
      return {};
    }

    // 3. Evaluate compiled code in sandboxed function with injected Remotion scope
    const runner = new Function(
      'require',
      'exports',
      'module',
      'React',
      'AbsoluteFill',
      'Sequence',
      'Composition',
      'useCurrentFrame',
      'useVideoConfig',
      'spring',
      'interpolate',
      'interpolateColors',
      'Easing',
      'Audio',
      'ThreeCanvas',
      'useFrame',
      'THREE',
      'Three',
      'Icon',
      transpiled.code
    );
    runner(
      customRequire,
      exports,
      module,
      React,
      Remotion.AbsoluteFill,
      Remotion.Sequence,
      Remotion.Composition,
      Remotion.useCurrentFrame,
      Remotion.useVideoConfig,
      Remotion.spring,
      Remotion.interpolate,
      (Remotion as any).interpolateColors || Remotion.interpolate,
      Remotion.Easing,
      EnhancedRemotion.Audio,
      RemotionThree.ThreeCanvas,
      (ReactThreeFiber as any).useFrame,
      Three,
      Three,
      Icon
    );

    // 4. Extract exported component (support MotioneerComposition, GlobeVideo, custom names, or RemotionRoot inner component)
    let RawComponent =
      exports.MotioneerComposition ||
      exports.GlobeVideo ||
      exports.Globe ||
      exports.Scene ||
      exports.MyComposition ||
      exports.default ||
      module.exports?.default;

    if (!RawComponent || typeof RawComponent !== 'function') {
      const functionExports = Object.entries(exports).filter(([k, v]) => typeof v === 'function');
      const nonRoot = functionExports.find(([k]) => k !== 'RemotionRoot' && k !== 'Root');
      if (nonRoot) {
        RawComponent = nonRoot[1];
      } else if (exports.RemotionRoot) {
        RawComponent = exports.RemotionRoot;
      } else if (functionExports.length > 0) {
        RawComponent = functionExports[0][1];
      }
    }

    if (!RawComponent || typeof RawComponent !== 'function') {
      return {
        Component: null,
        error: 'No valid React component exported. Please export const MotioneerComposition: React.FC = ...',
      };
    }

    // 5. Wrap in Error Boundary component to prevent player crashes
    class SafeComponentWrapper extends React.Component<any, { hasError: boolean; error: Error | null }> {
      constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }

      componentDidCatch(error: Error, info: any) {
        console.warn('[DynamicRemotionCompiler] Runtime component error:', error, info);
      }

      render() {
        if (this.state.hasError) {
          return React.createElement(
            Remotion.AbsoluteFill,
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(9, 9, 11, 0.95)',
                color: '#ef4444',
                fontFamily: 'monospace',
                padding: 32,
                boxSizing: 'border-box',
              },
            },
            React.createElement(
              'div',
              {
                style: {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  maxWidth: 640,
                  textAlign: 'center',
                },
              },
              React.createElement(
                'div',
                { style: { fontWeight: 800, fontSize: 16, marginBottom: 8 } },
                'Runtime Render Error in Custom TSX'
              ),
              React.createElement(
                'div',
                { style: { fontSize: 12, opacity: 0.85, wordBreak: 'break-word' } },
                this.state.error?.message || 'Unknown runtime error'
              )
            )
          );
        }

        return React.createElement(RawComponent, this.props);
      }
    }

    return { Component: SafeComponentWrapper, error: null };
  } catch (err: any) {
    const errorMsg = err?.message || 'Syntax or evaluation error in TSX code.';
    return { Component: null, error: errorMsg };
  }
}
