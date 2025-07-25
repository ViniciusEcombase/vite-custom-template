import React, { useState } from 'react';
import Logo from '../primitives/Logo';
import SearchBar from '../primitives/SearchBar';
import UserAuth from '../primitives/UserAuth';
import Cart from '../primitives/Cart';
import ChangeTheme from '../primitives/ChangeTheme';
import { useAuth } from '../../customHooks/useAuth';
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
              <UserAuth
                isLoggedIn={isLoggedIn}
                user={user}
                onLogin={login}
                onLogout={logout}
                onUserAction={handleUserAction}
              />
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
