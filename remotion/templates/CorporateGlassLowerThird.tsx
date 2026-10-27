import React from 'react';
import {
  AppleGlassSpeakerCard,
  AppleGlassSpeakerCardProps,
} from './AppleGlassSpeakerCard';

export type CorporateGlassLowerThirdProps = AppleGlassSpeakerCardProps;

export const CorporateGlassLowerThird: React.FC<CorporateGlassLowerThirdProps> = (props) => {
  return <AppleGlassSpeakerCard {...props} />;
};
