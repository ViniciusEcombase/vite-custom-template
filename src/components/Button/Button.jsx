import React from 'react';

const Button = ({
  children,
  text,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  className = '',
  loading = false,
  startIcon,
  endIcon,
  ...rest
}) => {
  const baseClasses = 'btn';
  const variantClasses = Array.isArray(variant)
    ? variant.map((v) => `btn-${v}`).join(' ')
    : `btn-${variant}`;

  const sizeClasses = `btn-${size}`;
  const widthClasses = fullWidth ? 'btn-full-width' : '';
  const loadingClasses = loading ? 'btn-loading' : '';

  const classNames = [
    baseClasses,
    variantClasses,
    sizeClasses,
    widthClasses,
    loadingClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (event) => {
    if (disabled || loading || !onClick) return;
    onClick(event);
  };

  const buttonContent = children || text;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classNames}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="btn-spinner" aria-hidden="true">
          <svg className="btn-spinner-icon" viewBox="0 0 24 24">
            <circle
              className="btn-spinner-circle"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="2"
            />
          </svg>
        </span>
      )}
      {startIcon && !loading && (
        <span className="btn-start-icon">{startIcon}</span>
      )}
      {buttonContent && <span className="btn-content">{buttonContent}</span>}
      {endIcon && !loading && <span className="btn-end-icon">{endIcon}</span>}
    </button>
  );
};

export default Button;
