import React from 'react';
import {
  VoxKineticHighlighter,
  VoxKineticHighlighterProps,
} from './VoxKineticHighlighter';

export type KineticBounceHookProps = VoxKineticHighlighterProps;

export const KineticBounceHook: React.FC<KineticBounceHookProps> = (props) => {
  return <VoxKineticHighlighter {...props} />;
};
