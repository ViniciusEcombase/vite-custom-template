import React from 'react';
import { Star } from 'lucide-react';

const RatingBar = ({ rating, count, percentage, isSelected, onClick }) => (
  <div
    className={`reviews-filter-item ${
      isSelected ? 'reviews-filter-item--active' : ''
    }`}
    onClick={onClick}
  >
    <div className="reviews-filter-item__rating">
      <span>{rating}</span>
      <Star className="star-rating__star star-rating__star--filled" />
    </div>
    <div className="reviews-filter-item__bar">
      <div
        className="reviews-filter-item__progress"
        style={{ width: `${percentage}%` }}
      />
    </div>
    <span className="reviews-filter-item__count">{count}</span>
  </div>
);

export default RatingBar;
