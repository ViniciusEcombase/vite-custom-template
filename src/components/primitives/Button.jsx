import React from 'react';

const Button = ({
  text,
  onClick,
  disabled,
  variant = 'primary',
  fullWidth = false,
}) => {
  const classNames = ['btn', `btn-${variant}`, fullWidth && 'btn-full']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      disabled={disabled}
      className={classNames}
      onClick={onClick}
      type="button"
    >
      {text}
    </button>
  );
};

export default Button;
