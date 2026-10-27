import React from 'react';
import {
  YoutubeCreatorActionBar,
  YoutubeCreatorActionBarProps,
} from './YoutubeCreatorActionBar';

export type SocialCreatorCalloutProps = YoutubeCreatorActionBarProps;

export const SocialCreatorCallout: React.FC<SocialCreatorCalloutProps> = (props) => {
  return <YoutubeCreatorActionBar {...props} />;
};
