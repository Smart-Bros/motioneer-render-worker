import React from 'react';
import {
  StripeMetricBentoCard,
  StripeMetricBentoCardProps,
} from './StripeMetricBentoCard';

export type MetricCounterCardProps = StripeMetricBentoCardProps;

export const MetricCounterCard: React.FC<MetricCounterCardProps> = (props) => {
  return <StripeMetricBentoCard {...props} />;
};
