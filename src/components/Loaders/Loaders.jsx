import React, { useState, useEffect } from 'react';

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

export const CartSalePriceLoader = ({ className = '' }) => {
  return (
    <div className={`cart-item-price-sale-loader ${className}`} role="status">
      <div
        className="price-current-loader"
        aria-label="Loading sale price..."
      />
      <div
        className="price-original-loader"
        aria-label="Loading original price..."
      />
      <div className="discount-badge-loader" aria-label="Loading discount..." />
    </div>
  );
};

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

export const SkeletonText = ({
  size = 'base',
  width = 'medium',
  context = 'content',
  className = '',
}) => {
  const sizeClass = `text-${size}`;
  const widthClass = `line-${width}`;
  const contextClass = context !== 'content' ? `context-${context}` : '';

  return (
    <div
      className={`loader-skeleton ${sizeClass} ${widthClass} ${contextClass} ${className}`}
      aria-label="Loading text..."
      role="status"
    />
  );
};

export const SkeletonGroup = ({
  lines = 3,
  sizes = ['base', 'base', 'sm'],
  widths = ['long', 'medium', 'short'],
  context = 'content',
  className = '',
}) => {
  return (
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
};

export const ButtonLoader = ({
  children,
  loading = false,
  context = 'interactive',
  className = '',
  ...props
}) => {
  return (
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
};

export const QuantityLoader = ({
  type = 'button', // 'button' | 'display' | 'remove'
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
      case 'pulse':
        return <div className="loader-pulse" />;
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



