import React from 'react';
import { Filter } from 'lucide-react';
import RatingBar from './RatingBar';

const ReviewsFilters = ({ payload, selectedRatingFilter, onFilterChange }) => {
  return (
    <div className="reviews-filters">
      <div className="reviews-filters__header">
        <Filter />
        <h3 className="reviews-filters__title">Filter by Rating</h3>
      </div>

      <div className="reviews-filters__list">
        <div
          className={`reviews-filter-item ${
            !selectedRatingFilter ? 'reviews-filter-item--active' : ''
          }`}
          onClick={() => onFilterChange(null)}
        >
          <span className="reviews-filter-item__rating">All</span>
        </div>

        {[5, 4, 3, 2, 1].map((rating) => (
          <RatingBar
            key={rating}
            rating={rating}
            count={payload.data[0].ratings_count[rating.toString()]}
            percentage={payload.data[0].ratings_percentage[rating.toString()]}
            isSelected={selectedRatingFilter === rating}
            onClick={() => onFilterChange(rating)}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewsFilters;
