import React from 'react';
import * as Lucide from 'lucide-react';
import { useWishlist } from '../../../contextProviders/WishlistProvider';
import Button from '../../Button/Button';

// ========================= //
// 🛍️ WISHLIST ITEM          //
// ========================= //

export const WishlistItem = ({
  item,
  viewMode,
  isSelected,
  onToggleSelect,
}) => {
  const { removeFromWishlist, currentWishlist } = useWishlist();

  const handleRemove = async () => {
    if (currentWishlist) {
      await removeFromWishlist(item.variant_id, currentWishlist.wishlist_id);
    }
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
          alt={item.variant_sku}
          className="wishlist-item-image"
        />

        <button className="wishlist-item-remove" onClick={handleRemove}>
          <Lucide.X size={16} />
        </button>
      </div>

      <div className="wishlist-item-content">
        <div className="wishlist-item-info">
          <h3 className="wishlist-item-name">{item.variant_name}</h3>

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

          {item.added_at && (
            <div className="wishlist-item-added-date">
              Added {formatDate(item.added_at)}
            </div>
          )}

          <div
            className={`wishlist-item-stock ${
              item.stock > 0 ? 'in-stock' : 'out-of-stock'
            }`}
          >
            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
          </div>
        </div>

        <div className="wishlist-item-actions">
          <Button
            size="sm"
            variant="secondary"
            endIcon={<Lucide.Move size={16} />}
            text={'Move'}
          />
          <Button
            text={item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            disabled={item.stock === 0}
          />
        </div>
      </div>
    </div>
  );
};
