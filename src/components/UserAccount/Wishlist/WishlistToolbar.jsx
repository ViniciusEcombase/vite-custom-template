// ========================= //
// WishlistToolbar.jsx
// ========================= //

import React from 'react';
import * as Lucide from 'lucide-react';
import Button from '../../Button/Button';

export const WishlistToolbar = ({
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

        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            startIcon={<Lucide.Grid3X3 size={16} />}
            size="sm"
            variant="outline"
            onClick={() => onViewModeChange('grid')}
            selected={viewMode === 'grid'}
          />
          <Button
            selected={viewMode === 'list'}
            startIcon={<Lucide.List size={16} />}
            size="sm"
            variant="outline"
            onClick={() => onViewModeChange('list')}
          />
        </div>
      </div>
    </div>
  );
};
