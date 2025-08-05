import React from 'react';

const ProductCard = ({
  image,
  title,
  description,
  price,
  originalPrice,
  rating = 4.5,
  reviews = 128,
  badge,
  onAddToCart,
  onViewDetails,
}) => {
  return (
    <div className="product-card">
      {/* Image Container */}
      <div className="product-image-container">
        <img
          src={
            image ||
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'
          }
          alt={title}
          className="product-image"
        />
        {badge && <span className="product-badge">{badge}</span>}
        <div className="product-overlay">
          <button className="quick-view-btn" onClick={onViewDetails}>
            Quick View
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="product-content">
        {/* Rating */}
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`star ${i < Math.floor(rating) ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="review-count">({reviews})</span>
        </div>

        {/* Title */}
        <h3 className="product-title">
          {title || 'Premium Wireless Headphones'}
        </h3>

        {/* Description */}
        <p className="product-description">
          {description ||
            'High-quality wireless headphones with noise cancellation and premium sound quality for the ultimate listening experience.'}
        </p>

        {/* Price Section */}
        <div className="product-pricing">
          <span className="current-price">${price || '299.99'}</span>
          {originalPrice && (
            <span className="original-price">${originalPrice}</span>
          )}
        </div>

        {/* Actions */}
        <div className="product-actions">
          <button className="add-to-cart-btn" onClick={onAddToCart}>
            Add to Cart
          </button>
          <button className="wishlist-btn" aria-label="Add to wishlist">
            ♡
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
