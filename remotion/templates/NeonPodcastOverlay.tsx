import React from 'react';
import {
  PodcastWaveformPill,
  PodcastWaveformPillProps,
} from './PodcastWaveformPill';

export type NeonPodcastOverlayProps = PodcastWaveformPillProps;

export const NeonPodcastOverlay: React.FC<NeonPodcastOverlayProps> = (props) => {
  return <PodcastWaveformPill {...props} />;
};
