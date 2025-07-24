import React, { useState } from 'react';
import CartDropdown from '../primitives/CartDropdown';
import { useClickOutside } from '../../customHooks/useClickOutside';
import Overlay from './Overlay';

const CartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
    <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
    <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
  </svg>
);

const Cart = ({
  cartItems,
  cartTotal,
  cartItemCount,
  onUpdateQuantity,
  onRemoveItem,
  onViewCart,
  onCheckout,
}) => {
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const cartRef = useClickOutside(() => setShowCartDropdown(false));

  return (
    <div className="cart-section" ref={cartRef}>
      <button
        className="cart-btn"
        onClick={() => setShowCartDropdown(!showCartDropdown)}
      >
        <CartIcon />
        <span className="cart-count">{cartItemCount}</span>
      </button>

      {showCartDropdown && (
        <Overlay
          onClickOut={() => {
            setShowCartDropdown(false);
          }}
        >
          <CartDropdown
            cartItems={cartItems}
            cartTotal={cartTotal}
            cartItemCount={cartItemCount}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onViewCart={() => {
              onViewCart();
              setShowCartDropdown(false);
            }}
            onCheckout={() => {
              onCheckout();
              setShowCartDropdown(false);
            }}
          />
        </Overlay>
      )}
    </div>
  );
};

export default Cart;
