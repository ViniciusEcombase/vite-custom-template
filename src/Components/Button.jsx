import React from 'react';

const Button = ({ text, onClick, disabled }) => {
  return (
    <button disabled={disabled} className="beautiful-button" onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
