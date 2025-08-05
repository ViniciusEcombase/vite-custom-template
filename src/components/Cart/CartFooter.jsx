import React from 'react';
import { useCart } from '../../contextProviders/CartProvider';
import { CartTotalLoader } from '../Loaders/Loaders'; // adjust path if needed

const CartFooter = ({ total, loading = false }) => {
  const { showCart } = useCart();

  return (
    showCart && (
      <div className="cart-footer">
        <div className="cart-total">
          {loading ? (
            <CartTotalLoader />
          ) : (
            <>
              <span className="cart-total-label">Total</span>
              <span className="cart-total-amount">${total}</span>
            </>
          )}
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
