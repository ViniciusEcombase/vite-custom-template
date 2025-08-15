import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SentimentIndicator = ({ sentiment }) => {
  const config = {
    positive: { icon: TrendingUp, modifier: 'positive' },
    negative: { icon: TrendingDown, modifier: 'negative' },
    neutral: { icon: Minus, modifier: 'neutral' },
  };

  const { icon: Icon, modifier } = config[sentiment] || config.neutral;

  return (
    <div className={`sentiment-indicator sentiment-indicator--${modifier}`}>
      <Icon className="sentiment-indicator__icon" />
      <span className="capitalize">{sentiment}</span>
    </div>
  );
};

export default SentimentIndicator;