import React, { useState } from 'react';
import { WishlistHeader } from './WishlistHeader';
import { WishlistTabs } from './WishlistTabs';
import { WishlistToolbar } from './WishlistToolbar';
import { WishlistItems } from './WishlistItems';
import { WishlistLoading } from './WishlistLoading';
import { WishlistEmpty } from './WishlistEmpty';
import { useWishlist } from '../../../contextProviders/WishlistProvider';

export const Wishlist = () => {
  const {
    wishlists,
    currentWishlist,
    setCurrentWishlist,
    loading: wishlistLoading,
  } = useWishlist();

  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState(new Set());

  const wishlistItems = currentWishlist?.items || [];

  const handleSelectAll = () => {
    if (selectedItems.size === wishlistItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(
        new Set(wishlistItems.map((item) => item.product_variant_id))
      );
    }
  };

  const handleToggleSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  if (wishlistLoading) {
    return <WishlistLoading />;
  }

  if (wishlists.length === 0) {
    return <WishlistEmpty />;
  }

  return (
    <div className="wishlist-container">
      <WishlistHeader />

      <WishlistTabs
        wishlists={wishlists}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentWishlist={currentWishlist}
        onWishlistChange={setCurrentWishlist}
      />

      <WishlistToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onClearSelection={() => setSelectedItems(new Set())}
        itemCount={wishlistItems.length}
      />

      <WishlistItems
        items={wishlistItems}
        viewMode={viewMode}
        selectedItems={selectedItems}
        onToggleSelect={handleToggleSelect}
      />
    </div>
  );
};

export default Wishlist;
