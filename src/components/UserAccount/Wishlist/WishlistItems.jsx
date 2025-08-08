import React from 'react';
import { WishlistItem } from './WishlistItem';
import { WishlistEmpty } from './WishlistEmpty';

// ========================= //
// 🛍️ WISHLIST ITEMS         //
// ========================= //

export const WishlistItems = ({
  items,
  viewMode,
  selectedItems,
  onToggleSelect,
}) => {
  if (items.length === 0) {
    return <WishlistEmpty />;
  }

  return (
    <div className={`wishlist-items ${viewMode}-view`}>
      {items.map((item) => {
        return (
          <WishlistItem
            key={item.variant_id}
            item={item}
            viewMode={viewMode}
            isSelected={selectedItems.has(item.variant_id)}
            onToggleSelect={() => onToggleSelect(item.variant_id)}
          />
        );
      })}
    </div>
  );
};
