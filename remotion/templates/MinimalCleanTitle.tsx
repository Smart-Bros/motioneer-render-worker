import React from 'react';
import {
  MinimalSwissTitleSplit,
  MinimalSwissTitleSplitProps,
} from './MinimalSwissTitleSplit';

export type MinimalCleanTitleProps = MinimalSwissTitleSplitProps;

export const MinimalCleanTitle: React.FC<MinimalCleanTitleProps> = (props) => {
  return <MinimalSwissTitleSplit {...props} />;
};
