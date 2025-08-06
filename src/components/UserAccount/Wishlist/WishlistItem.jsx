import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';

// ========================= //
// 🛍️ WISHLIST ITEM          //
// ========================= //

const WishlistItem = ({ item, viewMode, isSelected, onToggleSelect }) => {
  const { removeFromWishlist, currentWishlist } = useWishlist();

  const handleRemove = async () => {
    await removeFromWishlist(item.product_variant_id, currentWishlist.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`wishlist-item ${viewMode}-view`}>
      <div className="wishlist-item-image-container">
        <img
          src={item.file_url || '/placeholder-image.jpg'}
          alt={item.sku}
          className="wishlist-item-image"
        />
        <input
          type="checkbox"
          className="wishlist-item-checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
        />
        <button className="wishlist-item-remove" onClick={handleRemove}>
          <Lucide.X size={16} />
        </button>
      </div>

      <div className="wishlist-item-content">
        <div className="wishlist-item-info">
          <h3 className="wishlist-item-name">{item.sku}</h3>

          <div className="wishlist-item-price">
            <span className="wishlist-item-current-price">
              ${item.current_price}
            </span>
            {item.original_price > item.current_price && (
              <span className="wishlist-item-original-price">
                ${item.original_price}
              </span>
            )}
          </div>

          <div className="wishlist-item-added-date">
            Added {formatDate(item.added_at)}
          </div>

          <div
            className={`wishlist-item-stock ${
              item.stock > 0 ? 'in-stock' : 'out-of-stock'
            }`}
          >
            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
          </div>
        </div>

        <div className="wishlist-item-actions">
          <button className="add-to-cart-btn" disabled={item.stock === 0}>
            {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <button className="move-to-wishlist-btn">
            <Lucide.Move size={16} />
            Move
          </button>
        </div>
      </div>
    </div>
  );
};
