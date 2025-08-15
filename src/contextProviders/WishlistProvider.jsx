import React, { useState, useEffect, createContext, useContext } from 'react';
import useFetch from '../customHooks/useFetch';
import { useAuth } from './AuthProvider.tsx';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState([]);
  const [currentWishlist, setCurrentWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = useFetch({
    baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
    timeout: 10000,
    retries: 0,
    cache: false,
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
      Prefer: 'return=representation',
    },
  });

  // Fixed: Use the correct endpoint for Supabase functions
  const apiFunction = useFetch({
    baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc`, // Changed from /Function to /rpc
    timeout: 10000,
    retries: 0,
    cache: false,
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
    },
  });

  // ==================== //
  // When components mounts //
  // ==================== //

  useEffect(() => {
    const loadwishlists = async () => {
      if (user?.customer_id) {
        await loadWishlists(user.customer_id);
      }
    };
    loadwishlists();
  }, [user?.customer_id]);

  // ==================== //
  // 🧠 API FUNCTIONS      //
  // ==================== //

  const getWishlists = async () => {
    const { data, ok, error } = await api.get(
      `/wishlist_item_view?customer_id=eq.${user?.customer_id}`
    );
    if (!ok) throw new Error(error?.message || 'Failed to fetch wishlists');
    return data;
  };

  const createWishlist = async (name, description = '', isPublic = false) => {
    const { data, ok, error } = await api.post('/wishlists', {
      customer_id: user.customer_id,
      name: name,
      description: description,
      is_public: isPublic,
    });
    if (!ok) throw new Error(error?.message || 'Failed to create wishlist');
    return data?.[0];
  };

  // Fixed: Use correct RPC endpoint and function name
  const addToWishlistFunction = async (wishlistId, productVariantId) => {
    const { data, ok, error } = await apiFunction.post('/wishlist_add_to', {
      // Removed the leading slash
      p_wishlist_id: wishlistId,
      p_product_variant_id: productVariantId,
    });
    if (!ok) throw new Error(error?.message || 'Failed to add to wishlist');
    return data;
  };

  const removeFromWishlistFunction = async (wishlistId, productVariantId) => {
    const { ok, error } = await api.delete(
      `/wishlist_items?wishlist_id=eq.${wishlistId}&product_variant_id=eq.${productVariantId}`
    );
    if (!ok)
      throw new Error(error?.message || 'Failed to remove from wishlist');
  };

  const updateWishlist = async (wishlistId, name, description, isPublic) => {
    const { ok, error } = await api.patch(`/wishlists?id=eq.${wishlistId}`, {
      name: name,
      description: description,
      is_public: isPublic,
    });
    if (!ok) throw new Error(error?.message || 'Failed to update wishlist');
  };

  const deleteWishlist = async (wishlistId) => {
    const { ok, error } = await api.delete(`/wishlists?id=eq.${wishlistId}`);
    if (!ok) throw new Error(error?.message || 'Failed to delete wishlist');
  };

  const moveItem = async (productVariantId, fromWishlistId, toWishlistId) => {
    const { ok, error } = await apiFunction.post('/wishlist_move_item', {
      p_product_variant_id: productVariantId,
      p_from_wishlist_id: fromWishlistId,
      p_to_wishlist_id: toWishlistId,
    });
    if (!ok) throw new Error(error?.message || 'Failed to move item');
  };

  // ==================== //
  // 🔧 LOGIC FUNCTIONS    //
  // ==================== //

  // Helper function to clean items array (remove null values from empty wishlists)
  const cleanItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items.filter((item) => item && item.variant_id);
  };

  // Helper function to normalize wishlist data from view
  const normalizeWishlist = (viewData) => {
    return {
      // Main wishlist data (use consistent naming)
      id: viewData.wishlist_id, // Map wishlist_id from view to id for consistency
      wishlist_id: viewData.wishlist_id, // Keep original for API calls
      customer_id: viewData.customer_id,
      name: viewData.wishlist_name,
      description: viewData.wishlist_description,
      is_public: viewData.wishlist_is_public,
      created_at: viewData.wishlist_created_at,
      updated_at: viewData.wishlist_updated_at,

      // Items data (cleaned and normalized)
      items: cleanItems(viewData.items),
      item_count: cleanItems(viewData.items).length, // Calculate count from actual items
    };
  };

  const loadWishlists = async (customerId) => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getWishlists(customerId);
      const normalizedWishlists = (data || []).map(normalizeWishlist);
      setWishlists(normalizedWishlists);

      // Set current wishlist: either keep existing if still valid, or pick first one
      if (normalizedWishlists.length > 0) {
        const currentStillExists = normalizedWishlists.find(
          (w) => w.wishlist_id === currentWishlist?.wishlist_id
        );
        if (currentStillExists) {
          setCurrentWishlist(currentStillExists);
        } else if (!currentWishlist) {
          setCurrentWishlist(normalizedWishlists[0]);
        }
      } else {
        setCurrentWishlist(null);
      }
    } catch (err) {
      setError('Failed to load wishlists');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productVariant, wishlistId) => {
    try {
      const targetWishlistId = wishlistId || currentWishlist?.wishlist_id;
      if (!targetWishlistId) throw new Error('No wishlist selected');

      // Make API call first
      await addToWishlistFunction(targetWishlistId, productVariant.variant_id);

      // Refresh data from server to ensure consistency
      await loadWishlists(user.customer_id);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeFromWishlist = async (productVariantId, wishlistId = null) => {
    try {
      // Use the wishlist_id from current wishlist if not provided
      const targetWishlistId = wishlistId || currentWishlist?.wishlist_id;
      if (!targetWishlistId)
        throw new Error('No wishlist available to remove from');

      // Make API call first
      await removeFromWishlistFunction(targetWishlistId, productVariantId);

      // Refresh data from server to ensure consistency
      await loadWishlists(user.customer_id);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createNewWishlist = async (name, description, isPublic) => {
    try {
      const newWishlist = await createWishlist(name, description, isPublic);

      // Refresh data from server to get the complete wishlist with items
      await loadWishlists(user.customer_id);

      // Find and set the newly created wishlist as current
      const refreshedWishlists = wishlists;
      const createdWishlist = refreshedWishlists.find(
        (w) => w.wishlist_id === newWishlist.id
      );
      if (createdWishlist) {
        setCurrentWishlist(createdWishlist);
      }

      return { success: true, wishlist: newWishlist };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const isInWishlist = (productVariantId) => {
    return wishlists.some((wishlist) =>
      wishlist.items?.some((item) => item.variant_id === productVariantId)
    );
  };

  // Helper function to get current wishlist items
  const getCurrentWishlistItems = () => {
    return currentWishlist?.items || [];
  };

  // Force refresh function
  const refreshWishlists = async () => {
    if (user?.customer_id) {
      await loadWishlists(user.customer_id);
    }
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
    createWishlist: createNewWishlist,
    isInWishlist,
    refreshWishlists,
    updateWishlist,
    deleteWishlist,
    moveItem,
    getCurrentWishlistItems,
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
