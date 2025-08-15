import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useWishlist } from '../../../contextProviders/WishlistProvider';
import { WishlistSelectorModal } from './WishlistSelectorModal';
import { useAuth } from '../../../contextProviders/AuthProvider';

// ========================= //
// 🔘 WISHLIST BUTTON        //
// ========================= //

export const WishlistButton = ({
  productVariant,
  className = '',
  size = 'default',
  showTooltip = false,
  onAuthRequired,
}) => {
  const {
    addToWishlist,
    removeFromWishlist,
    wishlists,
    isInWishlist,
    createWishlist,
  } = useWishlist();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  const inWishlist = isInWishlist(productVariant.variant_id);

  // Fixed: Enhanced click handler with better event handling
  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check authentication first
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }

    // Prevent multiple clicks during loading
    if (loading) {
      return;
    }

    try {
      if (wishlists.length === 0) {
        // Auto-create default wishlist
        setLoading(true);
        const { success, wishlist } = await createWishlist(
          'My Wishlist',
          'Default wishlist',
          false
        );
        if (success) {
          // Add item to newly created wishlist
          const addResult = await addToWishlist(productVariant, wishlist.id);
          if (!addResult.success) {
            throw new Error(addResult.error || 'Failed to add to wishlist');
          }
        } else {
          throw new Error('Failed to create default wishlist');
        }
        return;
      }

      if (wishlists.length === 1) {
        // Single wishlist - direct add/remove
        setLoading(true);
        if (inWishlist) {
          const result = await removeFromWishlist(
            productVariant.variant_id,
            wishlists[0].wishlist_id
          );
          if (!result.success) {
            throw new Error(result.error || 'Failed to remove from wishlist');
          }
        } else {
          const result = await addToWishlist(
            productVariant,
            wishlists[0].wishlist_id
          );
          if (!result.success) {
            throw new Error(result.error || 'Failed to add to wishlist');
          }
        }
      } else {
        // Multiple wishlists - show selector
        setShowSelector(true);
      }
    } catch (error) {
      // You might want to show a toast notification here
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Enhanced close handler
  const handleCloseSelector = () => {
    setShowSelector(false);
  };

  return (
    <>
      <button
        className={`wishlist-button ${inWishlist ? 'in-wishlist' : ''} ${
          loading ? 'loading' : ''
        } ${className}`}
        onClick={handleClick}
        disabled={loading}
        title={
          showTooltip
            ? inWishlist
              ? 'Remove from wishlist'
              : 'Add to wishlist'
            : undefined
        }
      >
        <Lucide.Heart
          className="heart-icon"
          size={size === 'small' ? 16 : 20}
          fill={inWishlist ? 'currentColor' : 'none'}
          stroke={inWishlist ? 'currentColor' : 'currentColor'}
        />
      </button>

      {/* Fixed: Portal for modal to prevent z-index issues */}
      {showSelector && (
        <WishlistSelectorModal
          productVariant={productVariant}
          onClose={handleCloseSelector}
        />
      )}
    </>
  );
};
