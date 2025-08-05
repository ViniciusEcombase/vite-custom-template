import React, { useState } from 'react';
import CartItem from './CartItem';
import CartFooter from './CartFooter.jsx';
import { useCart } from '../../contextProviders/CartProvider';

const CartOverlay = () => {
  const { showCart, setShowCart, cartItems } = useCart();

  function handleClick({ target, currentTarget }) {
    if (target === currentTarget) {
      setShowCart(!showCart);
    }
  }

  // Extract cart data and calculate totals
  const cartData = cartItems?.data?.[0];
  const items = cartData?.items || [];
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartData?.total || 0;

  return (
    showCart && (
      <div onClick={handleClick} className="overlay">
        <div className="cart-dropdown">
          <div className="cart-header">
            <h3>Shopping Cart</h3>
            <div className="item-count">({itemCount}) items</div>
          </div>

          <div className="cart-items">
            <CartItem />
          </div>

          <CartFooter total={cartTotal} />
        </div>
      </div>
    )
  );
};

export default CartOverlay;
