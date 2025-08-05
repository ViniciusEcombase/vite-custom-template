// Cart/Cart.jsx
import React, { useState } from 'react';
import CartButton from './CartButton';
import CartOverlay from './CartOverlay';
import CartFooter from './CartFooter';

const Cart = () => {
  // Hardcoded cart items for now — replace with props or context later
  const items = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 299.99,
      quantity: 2,
    },
    {
      id: 2,
      name: 'Mechanical Gaming Keyboard',
      price: 149.99,
      quantity: 1,
    },
    {
      id: 3,
      name: 'Ultra-Wide Gaming Monitor 34"',
      price: 899.99,
      quantity: 1,
    },
  ];

  return (
    <div className="container">
      <div className="cart-section">
        <CartButton
          count={items.length}
          onClick={() => setShowCart(!showCart)}
        />
      </div>
      <CartOverlay />
    </div>
  );
};

export default Cart;
