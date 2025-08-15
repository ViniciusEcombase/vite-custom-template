import React from 'react';
import ReviewCard from './ReviewCard';
import ReviewsPagination from './ReviewsPagination';

const ReviewsList = ({
  reviews,
  formatDate,
  onImageClick,
  onVideoClick,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="reviews-list--empty">
        <p>No reviews found for the selected filter.</p>
      </div>
    );
  }

  return (
    <>
      <div className="reviews-list">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            formatDate={formatDate}
            onImageClick={onImageClick}
            onVideoClick={onVideoClick}
          />
        ))}
      </div>

      <ReviewsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default ReviewsList;
