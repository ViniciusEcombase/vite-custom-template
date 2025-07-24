import { useState, useMemo } from 'react';

export const useCart = (initialItems = []) => {
  const [cartItems, setCartItems] = useState(initialItems);

  const updateQuantity = (itemId, change) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
  };

  const addToCart = (newItem) => {
    setCartItems((items) => [...items, newItem]);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  return {
    cartItems,
    updateQuantity,
    removeFromCart,
    addToCart,
    clearCart,
    cartTotal,
    cartItemCount,
  };
};

export default useCart;
