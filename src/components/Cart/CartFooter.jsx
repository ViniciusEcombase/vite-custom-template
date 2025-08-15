import React from 'react';
import { useCart } from '../../contextProviders/CartProvider';
import { CartTotalLoader } from '../Loaders/Loaders'; // adjust path if needed
import Button from '../Button/Button';

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
          <Button
            variant="primary"
            size="full-width"
            text={'Checkout'}
            onClick={() => {
              window.location.href = '/checkout';
            }}
          />
        </div>
      </div>
    )
  );
};

export default CartFooter;
