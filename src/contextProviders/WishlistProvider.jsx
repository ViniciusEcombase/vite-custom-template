import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';

// ========================= //
// 🗂️ WISHLIST CONTEXT       //
// ========================= //

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlists, setWishlists] = useState([]);
  const [currentWishlist, setCurrentWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API functions using your database functions
  const api = {
    getWishlists: async (customerId) => {
      // Call your wishlist_get_all function
      const response = await fetch('/api/rpc/wishlist_get_all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_customer_id: customerId }),
      });
      return response.json();
    },

    createWishlist: async (
      customerId,
      name,
      description = '',
      isPublic = false
    ) => {
      const response = await fetch('/api/rpc/wishlist_create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_customer_id: customerId,
          p_name: name,
          p_description: description,
          p_is_public: isPublic,
        }),
      });
      return response.json();
    },

    addToWishlist: async (wishlistId, productVariantId) => {
      const response = await fetch('/api/rpc/wishlist_add_to', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_wishlist_id: wishlistId,
          p_product_variant_id: productVariantId,
        }),
      });
      return response.ok;
    },

    removeFromWishlist: async (wishlistId, productVariantId) => {
      const response = await fetch('/api/rpc/wishlist_remove_from', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_wishlist_id: wishlistId,
          p_product_variant_id: productVariantId,
        }),
      });
      return response.ok;
    },

    getWishlistItems: async (wishlistId) => {
      const response = await fetch('/api/rpc/wishlist_get_items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_wishlist_id: wishlistId }),
      });
      return response.json();
    },

    updateWishlist: async (wishlistId, name, description, isPublic) => {
      const response = await fetch('/api/rpc/wishlist_update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_wishlist_id: wishlistId,
          p_name: name,
          p_description: description,
          p_is_public: isPublic,
        }),
      });
      return response.ok;
    },

    deleteWishlist: async (wishlistId) => {
      const response = await fetch('/api/rpc/wishlist_delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_wishlist_id: wishlistId }),
      });
      return response.ok;
    },

    moveItem: async (productVariantId, fromWishlistId, toWishlistId) => {
      const response = await fetch('/api/rpc/wishlist_move_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_product_variant_id: productVariantId,
          p_from_wishlist_id: fromWishlistId,
          p_to_wishlist_id: toWishlistId,
        }),
      });
      return response.ok;
    },
  };

  // Load wishlists for current user
  const loadWishlists = async (customerId) => {
    if (!customerId) return;

    setLoading(true);
    try {
      const data = await api.getWishlists(customerId);
      setWishlists(data || []);
      if (data && data.length > 0 && !currentWishlist) {
        setCurrentWishlist(data[0]);
      }
    } catch (err) {
      setError('Failed to load wishlists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productVariant, wishlistId = null) => {
    try {
      const targetWishlist = wishlistId || currentWishlist?.id;
      if (!targetWishlist) throw new Error('No wishlist selected');

      await api.addToWishlist(targetWishlist, productVariant.variant_id);

      // Update local state
      setWishlists((prev) =>
        prev.map((w) =>
          w.id === targetWishlist ? { ...w, item_count: w.item_count + 1 } : w
        )
      );

      return {
        success: true,
        wishlist: wishlists.find((w) => w.id === targetWishlist),
      };
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      return { success: false, error: err.message };
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productVariantId, wishlistId) => {
    try {
      await api.removeFromWishlist(wishlistId, productVariantId);

      // Update local state
      setWishlists((prev) =>
        prev.map((w) =>
          w.id === wishlistId
            ? { ...w, item_count: Math.max(0, w.item_count - 1) }
            : w
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      return { success: false, error: err.message };
    }
  };

  // Create new wishlist
  const createWishlist = async (
    name,
    description = '',
    isPublic = false,
    customerId
  ) => {
    try {
      const newWishlist = await api.createWishlist(
        customerId,
        name,
        description,
        isPublic
      );
      setWishlists((prev) => [...prev, { ...newWishlist[0], item_count: 0 }]);
      return { success: true, wishlist: newWishlist[0] };
    } catch (err) {
      console.error('Failed to create wishlist:', err);
      return { success: false, error: err.message };
    }
  };

  // Check if item is in any wishlist
  const isInWishlist = (productVariantId) => {
    // This would need to be implemented based on your current wishlist items data
    // For now, return false - you'd need to track wishlist items in state
    return false;
  };

  const value = {
    wishlists,
    currentWishlist,
    setCurrentWishlist,
    loading,
    error,
    loadWishlists,
    addToWishlist,
    removeFromWishlist,
    createWishlist,
    isInWishlist,
    api,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
