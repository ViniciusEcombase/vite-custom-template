import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';

// ========================= //
// 📑 WISHLIST TABS          //
// ========================= //

const WishlistTabs = ({ wishlists, currentWishlist, onWishlistChange }) => {
  return (
    <div className="wishlist-tabs">
      {wishlists.map((wishlist) => (
        <button
          key={wishlist.id}
          className={`wishlist-tab ${
            currentWishlist?.id === wishlist.id ? 'active' : ''
          }`}
          onClick={() => onWishlistChange(wishlist)}
        >
          <span>{wishlist.name}</span>
          <span className="wishlist-tab-count">{wishlist.item_count}</span>
        </button>
      ))}
    </div>
  );
};
