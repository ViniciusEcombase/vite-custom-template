import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ReviewsPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    onPageChange(Math.max(currentPage - 1, 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(currentPage + 1, totalPages));
  };

  return (
    <div className="reviews-pagination">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="reviews-pagination__button"
      >
        <ChevronLeft />
      </button>

      <div className="reviews-pagination__pages">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`reviews-pagination__page ${
              currentPage === page ? 'reviews-pagination__page--active' : ''
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="reviews-pagination__button"
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default ReviewsPagination;
