import React, { useState } from 'react';
import Logo from '../Logo/Logo';
import SearchBar from '../SearchBar/SearchBar';
import UserAuth from '../UserAuth/UserAuth';
import Cart from '../Cart/Cart';
import ChangeTheme from '../ChangeTheme/ChangeTheme';
import { useAuth } from '../../contextProviders/AuthProvider';
import { useCart } from '../../customHooks/useCart';

const Header = () => {
  const [showThemePicker, setShowThemePicker] = useState(false);

  const { isLoggedIn, user, login, logout } = useAuth();
  const {
    cartItems,
    cartTotal,
    cartItemCount,
    updateQuantity,
    removeFromCart,
    addToCart,
  } = useCart([]);

  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
  };

  const toggleThemePicker = () => {
    setShowThemePicker((prev) => !prev);
  };

  const handleUserAction = (event) => {
    window.location.href = `/${event}`;
    console.log(event);
  };

  return (
    <>
      <header className="header">
        <div className="container header-container">
          <Logo variant="main" />
          <SearchBar onSearch={handleSearch} />

          <div className="header-actions">
            <div className="login-section">
              <UserAuth />
            </div>

            <Cart
              cartItems={cartItems}
              cartTotal={cartTotal}
              cartItemCount={cartItemCount}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onViewCart={() => console.log('View Cart')}
              onCheckout={() => console.log('Checkout')}
            />

            <div className="login-section">
              <ChangeTheme
                showThemePicker={showThemePicker}
                toggleThemePicker={toggleThemePicker}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
