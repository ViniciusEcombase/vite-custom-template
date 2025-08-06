import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';

// ========================= //
// 🗂️ MAIN WISHLIST PAGE     //
// ========================= //

export const Wishlist = () => {
  const { wishlists, currentWishlist, setCurrentWishlist, loading } =
    useWishlist();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    // Load items for current wishlist
    const loadItems = async () => {
      if (currentWishlist) {
        // Load wishlist items using your API
        const items = await fetch(
          `/api/wishlist/${currentWishlist.id}/items`
        ).then((r) => r.json());
        setWishlistItems(items || []);
      }
    };
    loadItems();
  }, [currentWishlist]);

  if (loading) {
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
        onSelectAll={() => {
          /* implement */
        }}
        onClearSelection={() => setSelectedItems(new Set())}
        itemCount={wishlistItems.length}
      />

      <WishlistItems
        items={wishlistItems}
        viewMode={viewMode}
        selectedItems={selectedItems}
        onToggleSelect={(itemId) => {
          const newSelected = new Set(selectedItems);
          if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
          } else {
            newSelected.add(itemId);
          }
          setSelectedItems(newSelected);
        }}
      />
    </div>
  );
};
