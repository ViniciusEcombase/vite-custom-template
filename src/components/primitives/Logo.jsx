import React from 'react';
import image from '../../assets/images/DundichsTaight.png';

const Logo = ({ className = '' }) => {
  function handleClick() {
    window.location.href = '/';
    return;
  }

  return (
    <div onClick={handleClick} className="logo">
      <img src={image} alt="Your Store Logo" />
    </div>
  );
};

export default Logo;
