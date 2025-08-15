import React from 'react';
import { Shield, Camera, Play } from 'lucide-react';
import StarRating from './StarRating';

const ReviewCard = ({ review, formatDate, onImageClick, onVideoClick }) => {
  return (
    <div className="review-card">
      {/* Review Header */}
      <div className="review-card__header">
        <div className="review-card__author">
          <div className="review-card__avatar">{review.customer_name[0]}</div>
          <div className="review-card__author-info">
            <div className="review-card__author-name">
              <span className="review-card__name">{review.customer_name}</span>
              {review.is_verified && (
                <div className="review-card__verified">
                  <Shield />
                  Verified
                </div>
              )}
            </div>
            <p className="review-card__date">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <div className="review-card__rating">
          <StarRating rating={review.rating} />
        </div>
      </div>

      {/* Review Content */}
      <div className="review-card__content">
        {review.title && <h4 className="review-card__title">{review.title}</h4>}
        <p className="review-card__text">{review.content}</p>
      </div>

      {/* Review Media */}
      {(review.images.length > 0 || review.videos.length > 0) && (
        <div className="review-card__media">
          {/* Images */}
          {review.images.map((image, index) => (
            <div
              key={`image-${index}`}
              className="review-media-item"
              onClick={() => onImageClick(image)}
            >
              <img
                src={image}
                alt="Review"
                className="review-media-item__image"
              />
              <div className="review-media-item__overlay">
                <Camera className="review-media-item__icon" />
              </div>
            </div>
          ))}

          {/* Videos */}
          {review.videos.map((video, index) => (
            <div
              key={`video-${index}`}
              className="review-video-item"
              onClick={() => onVideoClick(video)}
            >
              <video className="review-video-item__thumbnail" muted>
                <source src={video} />
              </video>
              <div className="review-video-item__overlay">
                <Play className="review-video-item__icon" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
