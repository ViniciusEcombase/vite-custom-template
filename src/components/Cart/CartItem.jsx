import React from 'react';
import { useCart } from '../../contextProviders/CartProvider';

const CartItem = () => {
  const { cartItems, addCartItem, removeCartItem, deleteCartItem, loading } =
    useCart();

  // Enhanced loading state management with better UX
  const [itemLoading, setItemLoading] = React.useState(new Map());
  const [priceLoading, setPriceLoading] = React.useState(new Map());

  const handleAddItem = async (item) => {
    const key = item.variant_id;
    setItemLoading((prev) => new Map(prev).set(key, 'adding'));
    setPriceLoading((prev) => new Map(prev).set(key, true));

    try {
      await addCartItem(item, 1);
    } catch (error) {
    } finally {
      setItemLoading((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
      setPriceLoading((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  };

  const handleRemoveItem = async (item) => {
    const key = item.variant_id;
    setItemLoading((prev) => new Map(prev).set(key, 'removing'));
    setPriceLoading((prev) => new Map(prev).set(key, true));

    try {
      await removeCartItem(item);
    } catch (error) {
    } finally {
      setItemLoading((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
      setPriceLoading((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  };

  const handleDeleteItem = async (item) => {
    const key = item.variant_id;
    setItemLoading((prev) => new Map(prev).set(key, 'deleting'));

    try {
      await deleteCartItem(item);
    } catch (error) {
    } finally {
      setItemLoading((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  };

  // Enhanced pricing renderer with better loading states
  const renderPricing = (item, isPriceLoading, loadingAction) => {
    const isOnSale =
      item.unit_original_price &&
      item.unit_current_price &&
      parseFloat(item.unit_current_price) <
        parseFloat(item.unit_original_price);

    if (isPriceLoading) {
      return (
        <div className="cart-item-pricing">
          {isOnSale ? (
            <div className="cart-item-price-sale-loader">
              <div className="price-current-loader"></div>
              <div className="price-original-loader"></div>
              <div className="discount-badge-loader"></div>
            </div>
          ) : (
            <div className="cart-item-price-loader size-lg with-currency"></div>
          )}
        </div>
      );
    }

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
      <div className="cart-item-pricing">
        {isOnSale ? (
          <div className="cart-item-price-sale">
            <div className="cart-item-price-current">
              ${parseFloat(item.total_price).toFixed(2)}
            </div>
            <div className="cart-item-price-original">
              $
              {(parseFloat(item.unit_original_price) * item.quantity).toFixed(
                2
              )}
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

        {/* Savings display */}
        {savings > 0 && (
          <div className="cart-item-savings">
            You save: ${savings.toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  // Enhanced quantity controls with better loading UX
  const renderQuantityControls = (item, isLoading, loadingAction) => {
    const isQuantityLoading =
      isLoading && (loadingAction === 'adding' || loadingAction === 'removing');

    return (
      <div className="cart-item-quantity">
        <button
          onClick={() => handleRemoveItem(item)}
          className={`quantity-btn ${
            loadingAction === 'removing' ? 'loading' : ''
          }`}
          disabled={item.quantity <= 1 || isLoading}
          title={
            item.quantity <= 1 ? 'Cannot reduce below 1' : 'Decrease quantity'
          }
        >
          <span>-</span>
        </button>

        <div
          className={`quantity-display ${isQuantityLoading ? 'loading' : ''}`}
        >
          {!isQuantityLoading && item.quantity}
        </div>

        <button
          onClick={() => handleAddItem(item)}
          className={`quantity-btn ${
            loadingAction === 'adding' ? 'loading' : ''
          }`}
          disabled={isLoading}
          title="Increase quantity"
        >
          <span>+</span>
        </button>
      </div>
    );
  };

  // Enhanced loading overlay component
  const LoadingOverlay = ({ type, variant = 'spinner' }) => {
    const getLoadingText = () => {
      switch (type) {
        case 'adding':
          return 'Adding...';
        case 'removing':
          return 'Updating...';
        case 'deleting':
          return 'Removing...';
        default:
          return 'Loading...';
      }
    };

    const getThemeClass = () => {
      switch (type) {
        case 'adding':
          return 'loader-theme-primary';
        case 'removing':
          return 'loader-theme-secondary';
        case 'deleting':
          return 'loader-theme-muted';
        default:
          return 'loader-theme-primary';
      }
    };

    return (
      <div className="cart-item-loader-overlay">
        <div className={`cart-item-loader ${getThemeClass()}`}>
          <div className="cart-loader-spinner"></div>
          <div className={`cart-loader-text cart-loader-${type}`}>
            {getLoadingText()}
          </div>
        </div>
      </div>
    );
  };

  // Extract items from the cart data structure
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
    .slice() // shallow copy so we don't mutate original state
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // oldest first
    .map((item) => {
      const loadingAction = itemLoading.get(item.variant_id);
      const isItemLoading = Boolean(loadingAction);
      const isPriceLoading = priceLoading.get(item.variant_id) || false;

      // Check if item is on sale for badge display
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

      return (
        <div
          key={item.cart_item_id || item.variant_id}
          className="cart-item"
          style={{ position: 'relative' }}
        >
          {/* Enhanced Loader Overlay - only for delete operations */}
          {isItemLoading && loadingAction === 'deleting' && (
            <LoadingOverlay type={loadingAction} variant="spinner" />
          )}

          <div className="cart-item-image">
            {item.primary_image ? (
              <img src={item.primary_image} alt={item.product_name} />
            ) : (
              <span>No Image</span>
            )}

            {/* Sale Badge with improved hierarchy */}
            {isOnSale && <div className="sale-badge">-{discountPercent}%</div>}

            {/* Other badges - only show if not on sale */}
            {!isOnSale && item.is_new && (
              <div className="sale-badge new-badge">NEW</div>
            )}

            {!isOnSale && !item.is_new && item.is_limited && (
              <div className="sale-badge limited-badge">LIMITED</div>
            )}
          </div>

          <div className="cart-item-details">
            {/* Product and variant info */}
            <div className="cart-item-info">
              <h4 className="cart-item-name" title={item.product_name}>
                {item.product_name}
              </h4>
              {item.variant_name && item.variant_name !== 'Default' && (
                <div className="cart-item-variant" title={item.variant_name}>
                  {item.variant_name}
                </div>
              )}
            </div>

            {/* Enhanced pricing with loading states */}
            {renderPricing(item, isPriceLoading, loadingAction)}

            {/* Enhanced quantity controls */}
            {renderQuantityControls(item, isItemLoading, loadingAction)}
          </div>

          {/* Enhanced remove button */}
          <button
            className={`cart-remove ${
              loadingAction === 'deleting' ? 'loading' : ''
            }`}
            title="Remove item from cart"
            onClick={() => handleDeleteItem(item)}
            disabled={isItemLoading}
            aria-label={`Remove ${item.product_name} from cart`}
          >
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
              <path d="M19,6V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V6M8,6V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V6"></path>
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      );
    });
};

export default CartItem;
