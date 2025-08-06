import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';

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
