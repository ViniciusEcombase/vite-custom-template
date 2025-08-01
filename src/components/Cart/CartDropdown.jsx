import CartItem from './CartItem';

const CartDropdown = ({
  cartItems,
  cartTotal,
  cartItemCount,
  onUpdateQuantity,
  onRemoveItem,
  onViewCart,
  onCheckout,
}) => {
  if (cartItems.length === 0) {
    return (
      <div className="cart-dropdown">
        <div className="cart-header">Shopping Cart</div>
        <div className="cart-empty">
          <p>Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-dropdown animate-slide-in-right overlay-content">
      <div className="cart-header">Shopping Cart ({cartItemCount} items)</div>

      <div className="cart-items">
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          <span className="cart-total-label">Total:</span>
          <span className="cart-total-amount">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="cart-actions">
          <button
            className="cart-action-btn cart-view-btn"
            onClick={onViewCart}
          >
            View Cart
          </button>
          <button
            className="cart-action-btn cart-checkout-btn"
            onClick={onCheckout}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDropdown;
