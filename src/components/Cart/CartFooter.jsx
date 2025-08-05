import React from 'react';
import { useCart } from '../../contextProviders/CartProvider';

const CartFooter = ({ total }) => {
  const { showCart } = useCart();

  return (
    showCart && (
      <div className="cart-footer">
        <div className="cart-total">
          <span className="cart-total-label">Total</span>
          <span className="cart-total-amount">${total}</span>
        </div>
        <div className="cart-actions">
          <button className="cart-action-btn cart-view-btn">View Cart</button>
          <button className="cart-action-btn cart-checkout-btn">
            <span>Checkout</span>
          </button>
        </div>
      </div>
    )
  );
};

export default CartFooter;
