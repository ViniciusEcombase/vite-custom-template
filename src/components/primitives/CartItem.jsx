const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3,6 5,6 21,6"></polyline>
    <path d="M19,6V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V6M8,6V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V6"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="cart-item">
      <div className="cart-item-image">IMG</div>
      <div className="cart-item-details">
        <div className="cart-item-name">{item.name}</div>
        <div className="cart-item-price">${item.price.toFixed(2)}</div>
        <div className="cart-item-quantity">
          <button
            className="quantity-btn"
            onClick={() => onUpdateQuantity(item.id, -1)}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="quantity-display">{item.quantity}</span>
          <button
            className="quantity-btn"
            onClick={() => onUpdateQuantity(item.id, 1)}
          >
            +
          </button>
        </div>
      </div>
      <button
        className="cart-remove"
        onClick={() => onRemove(item.id)}
        title="Remove item"
      >
        <TrashIcon />
      </button>
    </div>
  );
};

export default CartItem;
