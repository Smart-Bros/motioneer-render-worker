import React from 'react';
import { PodcastVoiceWave, PodcastVoiceWaveProps } from './PodcastVoiceWave';

export type PodcastWaveformPillProps = PodcastVoiceWaveProps;

export const PodcastWaveformPill: React.FC<PodcastWaveformPillProps> = (props) => {
  return <PodcastVoiceWave {...props} />;
};
