import React from 'react';
import {
  CartItemLoader,
  CartPriceLoader,
  CartSalePriceLoader,
  QuantityLoader,
} from '../Loaders/Loaders';
import { useCart } from '../../contextProviders/CartProvider';
import { useModalActions } from '../../contextProviders/ModalProvider';
import Button from '../Button/Button';

const CartItem = () => {
  const { cartItems, addCartItem, removeCartItem, deleteCartItem } = useCart();
  const [itemLoading, setItemLoading] = React.useState(new Map());
  const [priceLoading, setPriceLoading] = React.useState(new Map());
  const { showConfirmDialog } = useModalActions();

  const handleAdd = async (item) => {
    const key = item.variant_id;
    setItemLoading((prev) => new Map(prev).set(key, 'adding'));
    setPriceLoading((prev) => new Map(prev).set(key, true));
    try {
      await addCartItem(item, 1);
    } finally {
      setItemLoading((prev) => {
        const map = new Map(prev);
        map.delete(key);
        return map;
      });
      setPriceLoading((prev) => {
        const map = new Map(prev);
        map.delete(key);
        return map;
      });
    }
  };

  const handleRemove = async (item) => {
    const key = item.variant_id;
    setItemLoading((prev) => new Map(prev).set(key, 'removing'));
    setPriceLoading((prev) => new Map(prev).set(key, true));
    try {
      await removeCartItem(item);
    } finally {
      setItemLoading((prev) => {
        const map = new Map(prev);
        map.delete(key);
        return map;
      });
      setPriceLoading((prev) => {
        const map = new Map(prev);
        map.delete(key);
        return map;
      });
    }
  };

  const handleDelete = (item) => {
    const key = item.variant_id;

    showConfirmDialog({
      title: 'Are you sure?',
      message: 'This item will be deleted permanently',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setItemLoading((prev) => new Map(prev).set(key, 'deleting'));
        try {
          await deleteCartItem(item);
        } finally {
          setItemLoading((prev) => {
            const map = new Map(prev);
            map.delete(key);
            return map;
          });
        }
      },
    });
  };

  const items = cartItems?.data?.[0]?.items || [];

  if (!items.length) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <small>Add some items to get started</small>
      </div>
    );
  }

  return items
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((item) => {
      const key = item.variant_id;
      const loadingType = itemLoading.get(key);
      const isPriceLoading = priceLoading.get(key);

      const isOnSale =
        item.unit_original_price &&
        item.unit_current_price &&
        parseFloat(item.unit_current_price) <
          parseFloat(item.unit_original_price);

      const discountPercent = isOnSale
        ? Math.round(
            ((parseFloat(item.unit_original_price) -
              parseFloat(item.unit_current_price)) /
              parseFloat(item.unit_original_price)) *
              100
          )
        : 0;

      const savings = isOnSale
        ? (parseFloat(item.unit_original_price) -
            parseFloat(item.unit_current_price)) *
          item.quantity
        : 0;

      return (
        <div
          key={item.cart_item_id || key}
          className="cart-item"
          style={{ position: 'relative' }}
        >
          {loadingType && <CartItemLoader action={loadingType} />}

          <div className="cart-item-image">
            {item.primary_image ? (
              <img src={item.primary_image} alt={item.product_name} />
            ) : (
              <div className="cart-no-image">No Image</div>
            )}
          </div>

          <div className="cart-item-details">
            <div className="cart-item-info">
              <h4 className="cart-item-name" title={item.variant_name}>
                {item.variant_name}
              </h4>
              {item.variant_name && item.variant_name !== 'Default' && (
                <div className="cart-item-variant" title={item.product_name}>
                  {item.product_name}
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="cart-item-pricing">
              {isPriceLoading ? (
                isOnSale ? (
                  <CartSalePriceLoader />
                ) : (
                  <CartPriceLoader size="lg" />
                )
              ) : isOnSale ? (
                <div className="cart-item-price-sale">
                  <div className="cart-item-price-current">
                    ${parseFloat(item.total_price).toFixed(2)}
                  </div>
                  <div className="cart-item-price-original">
                    $
                    {(
                      parseFloat(item.unit_original_price) * item.quantity
                    ).toFixed(2)}
                  </div>
                  <div className="cart-item-discount-percent">
                    -{discountPercent}%
                  </div>
                </div>
              ) : (
                <div className="cart-item-price">
                  ${parseFloat(item.total_price).toFixed(2)}
                </div>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="cart-item-quantity">
              <QuantityLoader
                type="button"
                loading={loadingType === 'removing'}
                onClick={() => handleRemove(item)}
                disabled={item.quantity <= 1 || !!loadingType}
              >
                -
              </QuantityLoader>

              <QuantityLoader
                type="display"
                loading={loadingType === 'adding' || loadingType === 'removing'}
              >
                {item.quantity}
              </QuantityLoader>

              <QuantityLoader
                type="button"
                loading={loadingType === 'adding'}
                onClick={() => handleAdd(item)}
                disabled={!!loadingType}
              >
                +
              </QuantityLoader>
            </div>
          </div>

          <Button
            disabled={!!loadingType}
            variant="outline"
            size="sm"
            startIcon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3,6 5,6 21,6" />
                <path d="M19,6V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V6M8,6V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V6" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            }
            onClick={() => handleDelete(item)}
          />
        </div>
      );
    });
};

export default CartItem;
