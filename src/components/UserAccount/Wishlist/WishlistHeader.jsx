// ========================= //
// WishlistHeader.jsx
// ========================= //

import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { CreateWishlistModal } from './CreateWishlistModal';
import Button from '../../Button/Button';

export const WishlistHeader = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="wishlist-header">
      <div className="wishlist-title-section">
        <h1 className="wishlist-main-title">My Wishlists</h1>
        <p className="wishlist-subtitle">Save items you love for later</p>
      </div>

      <div className="wishlist-header-actions">
        <Button
          startIcon={<Lucide.Plus size={20} />}
          text={'Create Wishlist'}
          onClick={() => setShowCreateForm(true)}
        />
      </div>

      {showCreateForm && (
        <CreateWishlistModal onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
};
