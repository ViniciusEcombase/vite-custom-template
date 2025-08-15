import React from 'react';
import { Plus, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import StarRating from './StarRating';
import SentimentIndicator from './SentimentIndicator';

const ReviewsSummary = ({
  payload,
  onShowAllReviews,
  onWriteReview,
  formatDate,
}) => {
  const getSentiment = (positiveCount, negativeCount) => {
    const diff = positiveCount - negativeCount;
    if (diff === 0) return 'neutral';
    return diff > 0 ? 'positive' : 'negative';
  };

  return (
    <div className="reviews-container reviews-container--summary">
      <div className="reviews-summary">
        {/* Header */}
        <div className="reviews-summary__header">
          <h2 className="reviews-summary__title">What buyers are saying</h2>
          <SentimentIndicator
            sentiment={getSentiment(
              payload.data[0].ai_summary.positive_themes.length,
              payload.data[0].ai_summary.negative_themes.length
            )}
          />
        </div>

        {/* Summary Stats */}
        <div className="reviews-summary__stats">
          <div className="reviews-summary__stat">
            <div className="reviews-summary__stat-value reviews-summary__stat-value--primary">
              {payload?.data[0].average_rating?.toFixed(1)}
            </div>
            <StarRating rating={Math.round(payload.data[0].average_rating)} />
            <p className="reviews-summary__stat-label">
              {payload.data[0].total_reviews} reviews
            </p>
          </div>

          <div className="reviews-summary__stat">
            <div className="reviews-summary__stat-value reviews-summary__stat-value--positive">
              {payload.data[0].ai_summary.positive_themes.length}
            </div>
            <p className="reviews-summary__stat-label">Positive Themes</p>
          </div>

          <div className="reviews-summary__stat">
            <div className="reviews-summary__stat-value reviews-summary__stat-value--negative">
              {payload.data[0].ai_summary.negative_themes.length}
            </div>
            <p className="reviews-summary__stat-label">Areas for Improvement</p>
          </div>
        </div>

        {/* AI Summary Text */}
        <div className="reviews-summary__content">
          <h3 className="reviews-summary__content-title">Summary</h3>
          <p className="reviews-summary__text">
            {payload.data[0].ai_summary.summary_text}
          </p>
          <div className="reviews-summary__meta">Ai generated Summary</div>
        </div>

        {/* Themes */}
        <div className="reviews-summary__themes">
          <div className="reviews-summary__theme-section">
            <h3 className="reviews-summary__theme-title reviews-summary__theme-title--positive">
              <TrendingUp />
              What Customers Love
            </h3>
            <div className="reviews-summary__tags">
              {payload.data[0].ai_summary.positive_themes.map(
                (theme, index) => (
                  <span
                    key={index}
                    className="reviews-summary__tag reviews-summary__tag--positive"
                  >
                    {theme}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="reviews-summary__theme-section">
            <h3 className="reviews-summary__theme-title reviews-summary__theme-title--negative">
              <TrendingDown />
              Common Concerns
            </h3>
            <div className="reviews-summary__tags">
              {payload.data[0].ai_summary.negative_themes.map(
                (theme, index) => (
                  <span
                    key={index}
                    className="reviews-summary__tag reviews-summary__tag--negative"
                  >
                    {theme}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Last Analyzed */}
        <div className="reviews-summary__meta">
          <Calendar />
          <span>
            Last analyzed{' '}
            {formatDate(payload.data[0].ai_summary.last_analyzed_at)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="reviews-summary__actions">
          <button onClick={onShowAllReviews} className="btn btn--primary">
            See All Reviews
          </button>
          <button onClick={onWriteReview} className="btn btn--secondary">
            <Plus className="btn__icon" />
            Write Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSummary;
