import React from 'react';

const Logo = ({ className = '', variant = 'main', size = 'normal' }) => {
  const handleClick = () => {
    window.location.href = '/';
  };

  // Multiple Variants:
  // variant="main" - Full logo with icon, text, and tagline (default)
  // variant="compact" - Perfect for mobile headers
  // variant="minimal" - Clean version for smaller spaces
  // variant="icon" - Icon only for favicons

  // Size Options:

  // size="small" - Smaller version
  // size="normal" - Default size
  // size="large" - Larger version

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'logo-small';
      case 'large':
        return 'logo-large';
      default:
        return '';
    }
  };

  const renderMainLogo = () => (
    <div
      className={`main-logo ${getSizeClasses()} ${className}`}
      onClick={handleClick}
    >
      <div className="logo-icon">
        <div className="shopping-bag">
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
        </div>
      </div>
      <div>
        <div className="logo-text">E-ViDch</div>
        <div className="logo-tagline"></div>
      </div>
    </div>
  );

  const renderCompactLogo = () => (
    <div
      className={`compact-logo ${getSizeClasses()} ${className}`}
      onClick={handleClick}
    >
      <div className="compact-icon"></div>
      <div className="compact-text">ShopLux</div>
    </div>
  );

  const renderMinimalLogo = () => (
    <div
      className={`minimal-logo ${getSizeClasses()} ${className}`}
      onClick={handleClick}
    >
      <div className="minimal-icon"></div>
      <div className="minimal-text">ShopLux</div>
    </div>
  );

  const renderIconOnly = () => (
    <div
      className={`icon-only ${getSizeClasses()} ${className}`}
      onClick={handleClick}
    ></div>
  );

  switch (variant) {
    case 'compact':
      return renderCompactLogo();
    case 'minimal':
      return renderMinimalLogo();
    case 'icon':
      return renderIconOnly();
    default:
      return renderMainLogo();
  }
};

export default Logo;
