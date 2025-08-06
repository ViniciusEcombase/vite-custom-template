// ========================= //
// 💝 WISHLIST COMPONENTS    //
// ========================= //

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

// ========================= //
// 📋 WISHLIST SELECTOR      //
// ========================= //

export const WishlistSelectorModal = ({ productVariant, onClose }) => {
  const { wishlists, addToWishlist, createWishlist } = useWishlist();
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedWishlist && !showCreateForm) return;

    setLoading(true);

    try {
      if (showCreateForm && newWishlistName.trim()) {
        const result = await createWishlist(newWishlistName.trim());
        if (result.success) {
          await addToWishlist(productVariant, result.wishlist.id);
        }
      } else if (selectedWishlist) {
        await addToWishlist(productVariant, selectedWishlist.id);
      }
      onClose();
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wishlist-selector-overlay" onClick={onClose}>
      <div
        className="wishlist-selector-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wishlist-selector-header">
          <h3 className="wishlist-selector-title">Add to Wishlist</h3>
          <button className="wishlist-selector-close" onClick={onClose}>
            <Lucide.X size={20} />
          </button>
        </div>

        <div className="wishlist-options">
          {wishlists.map((wishlist) => (
            <div
              key={wishlist.id}
              className={`wishlist-option ${
                selectedWishlist?.id === wishlist.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedWishlist(wishlist)}
            >
              <div className="wishlist-option-radio"></div>
              <div className="wishlist-option-info">
                <div className="wishlist-option-name">{wishlist.name}</div>
                <div className="wishlist-option-count">
                  {wishlist.item_count} items
                </div>
              </div>
            </div>
          ))}
        </div>

        {showCreateForm ? (
          <div className="wishlist-create-form">
            <input
              type="text"
              placeholder="New wishlist name"
              value={newWishlistName}
              onChange={(e) => setNewWishlistName(e.target.value)}
              autoFocus
            />
          </div>
        ) : (
          <button
            className="wishlist-selector-create"
            onClick={() => setShowCreateForm(true)}
          >
            <Lucide.Plus size={20} />
            Create new wishlist
          </button>
        )}

        <div className="wishlist-selector-actions">
          <button className="wishlist-selector-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="wishlist-selector-confirm"
            onClick={handleConfirm}
            disabled={!selectedWishlist && !newWishlistName.trim()}
          >
            {loading ? 'Adding...' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

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

// ========================= //
// 🛠️ WISHLIST TOOLBAR       //
// ========================= //

const WishlistToolbar = ({
  viewMode,
  onViewModeChange,
  selectedItems,
  onSelectAll,
  onClearSelection,
  itemCount,
}) => {
  return (
    <div className="wishlist-toolbar">
      <div className="wishlist-toolbar-left">
        <div className="wishlist-info">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
          {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
        </div>

        <div className="wishlist-view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
          >
            <Lucide.Grid3X3 size={16} />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
          >
            <Lucide.List size={16} />
          </button>
        </div>
      </div>

      <div className="wishlist-toolbar-right">
        {selectedItems.size > 0 && (
          <>
            <button className="bulk-action-btn">
              <Lucide.ShoppingCart size={16} />
              Add Selected to Cart
            </button>
            <button className="bulk-action-btn">
              <Lucide.Trash2 size={16} />
              Remove Selected
            </button>
            <button className="bulk-action-btn" onClick={onClearSelection}>
              Clear Selection
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ========================= //
// 🛍️ WISHLIST ITEMS         //
// ========================= //

const WishlistItems = ({ items, viewMode, selectedItems, onToggleSelect }) => {
  if (items.length === 0) {
    return <WishlistEmpty />;
  }

  return (
    <div className={`wishlist-items ${viewMode}-view`}>
      {items.map((item) => (
        <WishlistItem
          key={item.product_variant_id}
          item={item}
          viewMode={viewMode}
          isSelected={selectedItems.has(item.product_variant_id)}
          onToggleSelect={() => onToggleSelect(item.product_variant_id)}
        />
      ))}
    </div>
  );
};

// ========================= //
// 🛍️ WISHLIST ITEM          //
// ========================= //

const WishlistItem = ({ item, viewMode, isSelected, onToggleSelect }) => {
  const { removeFromWishlist, currentWishlist } = useWishlist();

  const handleRemove = async () => {
    await removeFromWishlist(item.product_variant_id, currentWishlist.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`wishlist-item ${viewMode}-view`}>
      <div className="wishlist-item-image-container">
        <img
          src={item.file_url || '/placeholder-image.jpg'}
          alt={item.sku}
          className="wishlist-item-image"
        />
        <input
          type="checkbox"
          className="wishlist-item-checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
        />
        <button className="wishlist-item-remove" onClick={handleRemove}>
          <Lucide.X size={16} />
        </button>
      </div>

      <div className="wishlist-item-content">
        <div className="wishlist-item-info">
          <h3 className="wishlist-item-name">{item.sku}</h3>

          <div className="wishlist-item-price">
            <span className="wishlist-item-current-price">
              ${item.current_price}
            </span>
            {item.original_price > item.current_price && (
              <span className="wishlist-item-original-price">
                ${item.original_price}
              </span>
            )}
          </div>

          <div className="wishlist-item-added-date">
            Added {formatDate(item.added_at)}
          </div>

          <div
            className={`wishlist-item-stock ${
              item.stock > 0 ? 'in-stock' : 'out-of-stock'
            }`}
          >
            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
          </div>
        </div>

        <div className="wishlist-item-actions">
          <button className="add-to-cart-btn" disabled={item.stock === 0}>
            {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <button className="move-to-wishlist-btn">
            <Lucide.Move size={16} />
            Move
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================= //
// 📭 EMPTY STATES           //
// ========================= //

const WishlistEmpty = () => {
  return (
    <div className="wishlist-empty">
      <Lucide.Heart className="wishlist-empty-icon" />
      <h2 className="wishlist-empty-title">Your wishlist is empty</h2>
      <p className="wishlist-empty-message">
        Save items you love by clicking the heart icon on any product. They'll
        appear here so you can easily find them later.
      </p>
      <button className="browse-products-btn">
        <Lucide.ShoppingBag size={20} />
        Browse Products
      </button>
    </div>
  );
};

const WishlistLoading = () => {
  return (
    <div className="wishlist-loading">
      <div className="wishlist-loading-spinner"></div>
    </div>
  );
};

// ========================= //
// ➕ CREATE WISHLIST MODAL  //
// ========================= //

const CreateWishlistModal = ({ onClose }) => {
  const { createWishlist } = useWishlist();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const result = await createWishlist(
      name.trim(),
      description.trim(),
      isPublic
    );
    setLoading(false);

    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="wishlist-selector-overlay" onClick={onClose}>
      <div
        className="wishlist-selector-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wishlist-selector-header">
          <h3 className="wishlist-selector-title">Create New Wishlist</h3>
          <button className="wishlist-selector-close" onClick={onClose}>
            <Lucide.X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                color: 'var(--color-text-primary)',
              }}
            >
              Wishlist Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Holiday Gifts"
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                background: 'var(--color-gray-800)',
                border: '1px solid var(--color-gray-600)',
                borderRadius: 'var(--radius-base)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                color: 'var(--color-text-primary)',
              }}
            >
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                background: 'var(--color-gray-800)',
                border: '1px solid var(--color-gray-600)',
                borderRadius: 'var(--radius-base)',
                color: 'var(--color-text-primary)',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span style={{ color: 'var(--color-text-primary)' }}>
                Make this wishlist public
              </span>
            </label>
          </div>

          <div className="wishlist-selector-actions">
            <button
              type="button"
              className="wishlist-selector-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="wishlist-selector-confirm"
              disabled={!name.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create Wishlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================= //
// 🔔 TOAST NOTIFICATIONS    //
// ========================= //

export const WishlistToast = ({ type, title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: Lucide.Check,
    error: Lucide.AlertCircle,
  };

  const IconComponent = icons[type] || Lucide.Info;

  return (
    <div className={`wishlist-toast ${type}`}>
      <div className="wishlist-toast-icon">
        <IconComponent size={20} />
      </div>
      <div className="wishlist-toast-content">
        <div className="wishlist-toast-title">{title}</div>
        <div className="wishlist-toast-message">{message}</div>
      </div>
      <button className="wishlist-toast-close" onClick={onClose}>
        <Lucide.X size={16} />
      </button>
    </div>
  );
};
