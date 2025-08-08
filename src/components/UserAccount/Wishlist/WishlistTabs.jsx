import React from 'react';

// ========================= //
// 📑 WISHLIST TABS          //
// ========================= //

export const WishlistTabs = ({
  wishlists,
  currentWishlist,
  onWishlistChange,
}) => {
  return (
    <div className="wishlist-tabs">
      {wishlists.map((wishlist) => {
        return (
          <button
            key={wishlist.wishlist_id}
            className={`wishlist-tab ${
              currentWishlist?.wishlist_id === wishlist.wishlist_id
                ? 'active'
                : ''
            }`}
            onClick={() => onWishlistChange(wishlist)}
          >
            <span>{wishlist.name}</span>
            <span className="wishlist-tab-count">{wishlist.item_count}</span>
          </button>
        );
      })}
    </div>
  );
};
