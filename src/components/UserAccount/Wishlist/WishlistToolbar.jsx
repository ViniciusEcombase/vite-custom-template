import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';

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
