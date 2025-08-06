import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';
// ========================= //
// 📑 WISHLIST HEADER        //
// ========================= //

const WishlistHeader = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="wishlist-header">
      <div className="wishlist-title-section">
        <h1 className="wishlist-main-title">My Wishlists</h1>
        <p className="wishlist-subtitle">Save items you love for later</p>
      </div>

      <div className="wishlist-header-actions">
        <button
          className="create-wishlist-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <Lucide.Plus size={20} />
          Create Wishlist
        </button>
      </div>

      {showCreateForm && (
        <CreateWishlistModal onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
};
