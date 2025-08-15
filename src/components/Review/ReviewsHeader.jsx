import React from 'react';
import { Eye, Plus } from 'lucide-react';
import StarRating from './StarRating';

const ReviewsHeader = ({ payload, onShowSummary, onWriteReview }) => {
  return (
    <div className="reviews-header">
      <div className="reviews-header__content">
        <h2 className="reviews-header__title">Customer Reviews</h2>
        <div className="reviews-header__stats">
          <div className="reviews-header__rating">
            <span className="reviews-header__rating-value">
              {payload.data[0].average_rating?.toFixed(1)}
            </span>
            <StarRating rating={Math.round(payload.data[0].average_rating)} />
            <span className="reviews-header__rating-count">
              ({payload.data[0].total_reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="reviews-header__actions">
        <button onClick={onShowSummary} className="btn btn--secondary">
          <Eye className="btn__icon" />
          AI Summary
        </button>
        <button onClick={onWriteReview} className="btn btn--primary">
          <Plus className="btn__icon" />
          Write Review
        </button>
      </div>
    </div>
  );
};

export default ReviewsHeader;
