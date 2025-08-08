import React from 'react';
import * as Lucide from 'lucide-react';

export const WishlistEmpty = () => {
  return (
    <div className="wishlist-empty">
      <Lucide.Heart className="wishlist-empty-icon" />
      <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
      <p className="wishlist-empty-message">
        Save items you love by clicking the heart icon on any product. They'll
        appear here so you can easily find them later.
      </p>
      <button className="browse-products-btn">
        <Lucide.ShoppingBag size={20} />
        Browse Products
      </button>
    </div>
  );
};