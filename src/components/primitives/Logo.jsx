import React from 'react';

const Logo = ({ className = '' }) => {
  function handleClick() {
    window.location.href = '/';
    return;
  }

  return (
    <div onClick={handleClick} className={`logo ${className}`}>
      <img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Crect width='200' height='60' fill='%23ff7a00'/%3E%3Ctext x='100' y='35' text-anchor='middle' font-family='Arial, sans-serif' font-size='24' font-weight='bold' fill='white'%3ELOGO%3C/text%3E%3C/svg%3E"
        alt="Your Store Logo"
      />
    </div>
  );
};

export default Logo;
