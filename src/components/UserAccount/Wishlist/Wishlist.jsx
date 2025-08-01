import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  Settings,
  ChevronRight,
  MapPin,
} from 'lucide-react';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: 'Premium Wireless Earbuds',
      price: 199.99,
      image: null,
    },
    {
      id: 2,
      name: 'Smart Watch Series X',
      price: 399.99,
      image: null,
    },
    {
      id: 3,
      name: 'Mechanical Gaming Keyboard',
      price: 159.99,
      image: null,
    },
    {
      id: 4,
      name: 'Ultra-wide Monitor',
      price: 649.99,
      image: null,
    },
  ]);

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="content-area">
      <div className="content-header">
        <h2 className="content-title">My Wishlist</h2>
        <p className="content-subtitle">Items you want to purchase later</p>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map((item) => (
          <div key={item.id} className="wishlist-item">
            <div className="wishlist-image">
              <span>No Image</span>
            </div>
            <div className="wishlist-content">
              <h4>{item.name}</h4>
              <div className="wishlist-price">${item.price}</div>
              <div className="flex" style={{ gap: 'var(--space-3)' }}>
                <button className="btn btn-primary">Add to Cart</button>
                <button
                  className="btn btn-secondary"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Heart className="icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
