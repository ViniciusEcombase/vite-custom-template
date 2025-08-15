import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../Button/Button';

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
      <Button
        startIcon={<ChevronLeft />}
        size="sm"
        variant={'outline'}
        disabled={currentPage === 1}
        onClick={handlePrevious}
      />

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

      <Button
        startIcon={<ChevronRight />}
        size="sm"
        variant={'outline'}
        disabled={currentPage === totalPages}
        onClick={handleNext}
      />
    </div>
  );
};

export default ReviewsPagination;
