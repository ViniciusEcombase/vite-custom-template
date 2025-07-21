import React from 'react';

const Button = ({ text, onClick, disabled }) => {
  return (
    <button
      disabled={disabled}
      className="btn btn-primary btn-full"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
