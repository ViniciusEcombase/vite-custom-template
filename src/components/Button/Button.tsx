import React from 'react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'outline';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  text?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: ButtonVariant | ButtonVariant[];
  size?: ButtonSize;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  selected?: boolean;
}

const Button: React.FC<ButtonProps> = ({
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
  selected = false,
  ...rest
}) => {
  const baseClasses = 'btn';
  const variantClasses = Array.isArray(variant)
    ? variant.map((v) => `btn-${v}`).join(' ')
    : `btn-${variant}`;

  const sizeClasses = `btn-${size}`;
  const widthClasses = fullWidth ? 'btn-full-width' : '';
  const loadingClasses = loading ? 'btn-loading' : '';
  const selectedClasses = selected ? 'btn-selected' : '';

  const classNames = [
    baseClasses,
    variantClasses,
    sizeClasses,
    widthClasses,
    loadingClasses,
    selectedClasses,
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
      aria-pressed={selected}
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
