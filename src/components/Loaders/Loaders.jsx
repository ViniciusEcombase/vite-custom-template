import React, { useState } from 'react';

// ========================= //
// 🛍️ CART-SPECIFIC LOADERS  //
// ========================= //

export const CartItemLoader = ({
  action = 'updating',
  text,
  className = '',
}) => {
  const actionText =
    text ||
    {
      updating: 'Updating...',
      adding: 'Adding to cart...',
      removing: 'Removing...',
      deleting: 'Deleting item...',
    }[action];

  return (
    <div className={`cart-item-loader-overlay ${className}`}>
      <div className={`cart-item-loader cart-loader-${action}`}>
        <div className="cart-loader-spinner" />
        <div className="cart-loader-text">{actionText}</div>
      </div>
    </div>
  );
};

export const CartPriceLoader = ({
  size = 'base',
  withCurrency = true,
  className = '',
}) => {
  const sizeClass = `size-${size}`;
  const currencyClass = withCurrency ? 'with-currency' : '';

  return (
    <div
      className={`cart-item-price-loader ${sizeClass} ${currencyClass} ${className}`}
      aria-label="Loading price..."
      role="status"
    />
  );
};

export const CartSalePriceLoader = ({ className = '' }) => (
  <div className={`cart-item-price-sale-loader ${className}`} role="status">
    <div className="price-current-loader" aria-label="Loading sale price..." />
    <div
      className="price-original-loader"
      aria-label="Loading original price..."
    />
    <div className="discount-badge-loader" aria-label="Loading discount..." />
  </div>
);

export const CartTotalLoader = ({ className = '' }) => (
  <div className={`cart-total-loader ${className}`} role="status">
    <div
      className="cart-total-label-loader"
      aria-label="Loading total label..."
    />
    <div
      className="cart-total-amount-loader"
      aria-label="Loading total amount..."
    />
  </div>
);

export const CartCountLoader = ({ className = '' }) => (
  <div
    className={`cart-count loading ${className}`}
    aria-label="Loading cart count..."
    role="status"
  >
    0
  </div>
);

// ========================= //
// 🔄 ENHANCED SPINNERS      //
// ========================= //

export const Spinner = ({
  size = 'base',
  theme = 'primary',
  context = 'content',
  className = '',
}) => {
  const sizeClass = size !== 'base' ? `size-${size}` : '';
  const themeClass = theme !== 'primary' ? `theme-${theme}` : '';
  const contextClass = context !== 'content' ? `context-${context}` : '';

  return (
    <div
      className={`loader-spinner ${sizeClass} ${themeClass} ${contextClass} ${className}`}
      aria-label="Loading..."
      role="status"
    />
  );
};

export const DotsLoader = ({
  size = 'base',
  theme = 'primary',
  className = '',
}) => (
  <div
    className={`loader-dots loader-theme-${theme} ${
      size !== 'base' ? `size-${size}` : ''
    } ${className}`}
    aria-label="Loading..."
    role="status"
  >
    <div className="loader-dot" />
    <div className="loader-dot" />
    <div className="loader-dot" />
  </div>
);

export const PulseLoader = ({
  size = 'base',
  theme = 'primary',
  className = '',
}) => (
  <div
    className={`loader-pulse loader-theme-${theme} ${
      size !== 'base' ? `size-${size}` : ''
    } ${className}`}
    aria-label="Loading..."
    role="status"
    style={{
      width:
        size === 'xs'
          ? '12px'
          : size === 'sm'
          ? '16px'
          : size === 'lg'
          ? '32px'
          : size === 'xl'
          ? '48px'
          : '20px',
      height:
        size === 'xs'
          ? '12px'
          : size === 'sm'
          ? '16px'
          : size === 'lg'
          ? '32px'
          : size === 'xl'
          ? '48px'
          : '20px',
      backgroundColor: 'var(--color-primary)',
      borderRadius: '50%',
      animation: 'pulse-glow 1.5s ease-in-out infinite',
    }}
  />
);

// ========================= //
// 🎯 SKELETON LOADERS       //
// ========================= //

export const SkeletonText = ({
  size = 'base',
  width = 'medium',
  context = 'content',
  className = '',
  style = {},
}) => {
  const sizeClass = `text-${size}`;
  const widthClass = `line-${width}`;
  const contextClass = context !== 'content' ? `context-${context}` : '';

  return (
    <div
      className={`loader-skeleton ${sizeClass} ${widthClass} ${contextClass} ${className}`}
      aria-label="Loading text..."
      role="status"
      style={style}
    />
  );
};

export const SkeletonGroup = ({
  lines = 3,
  sizes = ['base', 'base', 'sm'],
  widths = ['long', 'medium', 'short'],
  context = 'content',
  className = '',
}) => (
  <div className={`loader-skeleton-group ${className}`} role="status">
    {Array.from({ length: lines }, (_, i) => (
      <SkeletonText
        key={i}
        size={sizes[i] || 'base'}
        width={widths[i] || (i === lines - 1 ? 'short' : 'medium')}
        context={context}
        style={{ marginBottom: i === lines - 1 ? '0' : '8px' }}
      />
    ))}
  </div>
);

// ========================= //
// 🎯 INTERACTIVE LOADERS    //
// ========================= //

export const ButtonLoader = ({
  children,
  loading = false,
  context = 'interactive',
  className = '',
  ...props
}) => (
  <button
    className={`${className} ${
      loading ? `btn-loading context-${context}` : ''
    }`}
    disabled={loading}
    {...props}
  >
    {children}
  </button>
);

export const QuantityLoader = ({
  type = 'button',
  children,
  loading = false,
  className = '',
  ...props
}) => {
  if (type === 'display') {
    return (
      <div
        className={`quantity-display ${loading ? 'loading' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (type === 'remove') {
    return (
      <button
        className={`cart-remove ${loading ? 'loading' : ''} ${className}`}
        disabled={loading}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={`quantity-btn ${loading ? 'loading' : ''} ${className}`}
      disabled={loading}
      {...props}
    >
      {children}
    </button>
  );
};

export const InputLoader = ({ loading = false, className = '', ...props }) => (
  <input
    className={`${className} ${loading ? 'input-loading' : ''}`}
    disabled={loading}
    {...props}
  />
);

// ========================= //
// 🎯 OVERLAY LOADERS        //
// ========================= //

export const CardLoadingOverlay = ({
  loading = false,
  text = 'Loading...',
  loaderType = 'spinner',
  theme = 'primary',
  children,
  className = '',
}) => {
  if (!loading) return children;

  const renderLoader = () => {
    const props = { theme, size: 'lg' };
    switch (loaderType) {
      case 'dots':
        return <DotsLoader {...props} />;
      case 'pulse':
        return <PulseLoader {...props} />;
      default:
        return <Spinner {...props} />;
    }
  };

  return (
    <div style={{ position: 'relative' }} className={className}>
      {children}
      <div className="card-loading-overlay">
        {renderLoader()}
        {text && <div className="card-loading-text">{text}</div>}
      </div>
    </div>
  );
};

export const FullscreenLoader = ({
  loading = false,
  text = 'Loading...',
  loaderType = 'spinner',
  theme = 'primary',
}) => {
  if (!loading) return null;

  const renderLoader = () => {
    const props = { theme, size: 'xl' };
    switch (loaderType) {
      case 'dots':
        return <DotsLoader {...props} />;
      case 'pulse':
        return <PulseLoader {...props} />;
      default:
        return <Spinner {...props} />;
    }
  };

  return (
    <div className="loader-fullscreen">
      {renderLoader()}
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

// ========================= //
// 🛒 COMPLETE CART COMPONENT //
// ========================= //

export const CartItemWithLoader = ({
  item,
  loading = false,
  loadingAction = 'updating',
  onQuantityChange,
  onRemove,
}) => {
  const [quantityLoading, setQuantityLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  const isOnSale =
    item.original_price &&
    parseFloat(item.current_price) < parseFloat(item.original_price);

  const handleQuantityChange = async (newQuantity) => {
    setQuantityLoading(true);
    try {
      await onQuantityChange?.(item.id, newQuantity);
    } finally {
      setQuantityLoading(false);
    }
  };

  const handleRemove = async () => {
    setRemoveLoading(true);
    try {
      await onRemove?.(item.id);
    } finally {
      setRemoveLoading(false);
    }
  };

  const renderPrice = () => {
    if (loading) {
      return isOnSale ? <CartSalePriceLoader /> : <CartPriceLoader size="lg" />;
    }

    if (isOnSale) {
      const discountPercent = Math.round(
        ((parseFloat(item.original_price) - parseFloat(item.current_price)) /
          parseFloat(item.original_price)) *
          100
      );

      return (
        <div className="cart-item-price-sale">
          <div className="cart-item-price-current">
            ${(parseFloat(item.current_price) * item.quantity).toFixed(2)}
          </div>
          <div className="cart-item-price-original">
            ${(parseFloat(item.original_price) * item.quantity).toFixed(2)}
          </div>
          <div className="cart-item-discount-percent">-{discountPercent}%</div>
        </div>
      );
    }

    return (
      <div className="cart-item-price">
        ${(parseFloat(item.current_price || item.price) * item.quantity).toFixed(2)}
      </div>
    );
  };

  return (
    <div className="cart-item" style={{ position: 'relative' }}>
      {loading && <CartItemLoader action={loadingAction} />}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h4>{item.name}</h4>
          <div className="cart-item-pricing">{renderPrice()}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <QuantityLoader
            type="button"
            loading={quantityLoading}
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            -
          </QuantityLoader>

          <QuantityLoader type="display" loading={quantityLoading}>
            {item.quantity}
          </QuantityLoader>

          <QuantityLoader
            type="button"
            loading={quantityLoading}
            onClick={() => handleQuantityChange(item.quantity + 1)}
          >
            +
          </QuantityLoader>

          <QuantityLoader
            type="remove"
            loading={removeLoading}
            onClick={handleRemove}
          >
            Remove
          </QuantityLoader>
        </div>
      </div>
    </div>
  );
};

// ========================= //
// 🎯 UTILITY COMPONENTS     //
// ========================= //

export const LoaderCenter = ({ children, className = '' }) => (
  <div className={`loader-center ${className}`}>{children}</div>
);

export const LoaderInline = ({ children, className = '' }) => (
  <div className={`loader-inline ${className}`}>{children}</div>
);

// ========================= //
// 📦 EXPORT ALL COMPONENTS  //
// ========================= //

export default {
  CartItemLoader,
  CartPriceLoader,
  CartSalePriceLoader,
  CartTotalLoader,
  CartCountLoader,

  Spinner,
  DotsLoader,
  PulseLoader,

  SkeletonText,
  SkeletonGroup,

  ButtonLoader,
  QuantityLoader,
  InputLoader,

  CardLoadingOverlay,
  FullscreenLoader,

  CartItemWithLoader,

  LoaderCenter,
  LoaderInline,
};
