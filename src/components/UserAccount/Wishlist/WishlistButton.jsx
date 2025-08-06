import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';

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
  const { addToWishlist, removeFromWishlist, wishlists, isInWishlist } =
    useWishlist();
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  const inWishlist = isInWishlist(productVariant.variant_id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check authentication
    if (!onAuthRequired || onAuthRequired()) return;

    if (wishlists.length === 0) {
      // No wishlists - show create prompt or auto-create
      return;
    }

    if (wishlists.length === 1) {
      // Single wishlist - direct add/remove
      setLoading(true);
      if (inWishlist) {
        await removeFromWishlist(productVariant.variant_id, wishlists[0].id);
      } else {
        await addToWishlist(productVariant);
      }
      setLoading(false);
    } else {
      // Multiple wishlists - show selector
      setShowSelector(true);
    }
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
          fill={inWishlist ? 'currentColor' : 'none'}
        />
      </button>

      {showSelector && (
        <WishlistSelectorModal
          productVariant={productVariant}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  );
};
