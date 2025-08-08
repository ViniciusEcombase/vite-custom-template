import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useWishlist } from '../../../contextProviders/WishlistProvider';

// ========================= //
// 📋 WISHLIST SELECTOR      //
// ========================= //

export const WishlistSelectorModal = ({ productVariant, onClose }) => {
  const { wishlists, addToWishlist, createWishlist } = useWishlist();
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [loading, setLoading] = useState(false);

  // Fixed: Add useEffect to prevent body scroll and ensure modal focus
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Fixed: Enhanced handleConfirm with better error handling
  const handleConfirm = async () => {
    if (!selectedWishlist && !showCreateForm) return;
    if (showCreateForm && !newWishlistName.trim()) return;

    setLoading(true);

    try {
      let result;

      if (showCreateForm && newWishlistName.trim()) {
        // Create new wishlist and add item to it
        const createResult = await createWishlist(
          newWishlistName.trim(),
          '',
          false
        );
        if (createResult.success) {
          result = await addToWishlist(
            productVariant,
            createResult.wishlist.id
          );
        } else {
          throw new Error(createResult.error || 'Failed to create wishlist');
        }
      } else if (selectedWishlist) {
        // Add to selected existing wishlist
        result = await addToWishlist(
          productVariant,
          selectedWishlist.wishlist_id
        );
      }

      if (result && result.success) {
        onClose();
      } else {
        throw new Error(result?.error || 'Failed to add to wishlist');
      }
    } catch (err) {
      // You might want to show a toast notification here
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Enhanced handleOverlayClick to prevent accidental closes
  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not on child elements
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fixed: Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="wishlist-selector-overlay" onClick={handleOverlayClick}>
      <div
        className="wishlist-selector-modal"
        onClick={(e) => e.stopPropagation()} // Fixed: Prevent event bubbling
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
              key={wishlist.wishlist_id}
              className={`wishlist-option ${
                selectedWishlist?.wishlist_id === wishlist.wishlist_id
                  ? 'selected'
                  : ''
              }`}
              onClick={() => setSelectedWishlist(wishlist)}
            >
              <div className="wishlist-option-radio">
                {selectedWishlist?.wishlist_id === wishlist.wishlist_id && (
                  <div />
                )}
              </div>
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newWishlistName.trim()) {
                  handleConfirm();
                }
              }}
            />
          </div>
        ) : (
          <button
            className="wishlist-selector-create"
            onClick={() => setShowCreateForm(true)}
          >
            <Lucide.Plus size={20} style={{ marginRight: '8px' }} />
            Create new wishlist
          </button>
        )}

        <div className="wishlist-selector-actions">
          <button
            className="wishlist-selector-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="wishlist-selector-confirm"
            onClick={handleConfirm}
            disabled={(!selectedWishlist && !newWishlistName.trim()) || loading}
          >
            {loading ? 'Adding...' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
};
