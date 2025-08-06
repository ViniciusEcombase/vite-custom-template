import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';

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
