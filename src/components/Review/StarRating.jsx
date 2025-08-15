import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating, 
  interactive = false, 
  className = '', 
  onRatingChange 
}) => {
  const starClasses = `star-rating ${
    interactive ? 'star-rating--interactive' : ''
  } ${className}`;

  const handleStarClick = (starIndex) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className={starClasses}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`star-rating__star ${
            i < rating ? 'star-rating__star--filled' : ''
          }`}
          onClick={interactive ? () => handleStarClick(i) : undefined}
        />
      ))}
    </div>
  );
};

export default StarRating;