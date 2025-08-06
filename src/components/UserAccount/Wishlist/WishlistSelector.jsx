import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';

// ========================= //
// 📋 WISHLIST SELECTOR      //
// ========================= //

export const WishlistSelectorModal = ({ productVariant, onClose }) => {
  const { wishlists, addToWishlist, createWishlist } = useWishlist();
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedWishlist && !showCreateForm) return;

    setLoading(true);

    try {
      if (showCreateForm && newWishlistName.trim()) {
        const result = await createWishlist(newWishlistName.trim());
        if (result.success) {
          await addToWishlist(productVariant, result.wishlist.id);
        }
      } else if (selectedWishlist) {
        await addToWishlist(productVariant, selectedWishlist.id);
      }
      onClose();
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wishlist-selector-overlay" onClick={onClose}>
      <div
        className="wishlist-selector-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wishlist-selector-header">
          <h3 className="wishlist-selector-title">Add to Wishlist</h3>
          <button className="wishlist-selector-close" onClick={onClose}>
            <Lucide.X size={20} />
          </button>
        </div>

        <div className="wishlist-options">
          {wishlists.map((wishlist) => (
            <div
              key={wishlist.id}
              className={`wishlist-option ${
                selectedWishlist?.id === wishlist.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedWishlist(wishlist)}
            >
              <div className="wishlist-option-radio"></div>
              <div className="wishlist-option-info">
                <div className="wishlist-option-name">{wishlist.name}</div>
                <div className="wishlist-option-count">
                  {wishlist.item_count} items
                </div>
              </div>
            </div>
          ))}
        </div>

        {showCreateForm ? (
          <div className="wishlist-create-form">
            <input
              type="text"
              placeholder="New wishlist name"
              value={newWishlistName}
              onChange={(e) => setNewWishlistName(e.target.value)}
              autoFocus
            />
          </div>
        ) : (
          <button
            className="wishlist-selector-create"
            onClick={() => setShowCreateForm(true)}
          >
            <Lucide.Plus size={20} />
            Create new wishlist
          </button>
        )}

        <div className="wishlist-selector-actions">
          <button className="wishlist-selector-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="wishlist-selector-confirm"
            onClick={handleConfirm}
            disabled={!selectedWishlist && !newWishlistName.trim()}
          >
            {loading ? 'Adding...' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
};
