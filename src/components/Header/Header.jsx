import React, { useState } from 'react';
import Logo from '../Logo/Logo';
import SearchBar from '../SearchBar/SearchBar';
import UserAuth from '../UserAuth/UserAuth';
import Cart from '../Cart/Cart';
import ChangeTheme from '../ChangeTheme/ChangeTheme';
import { useAuth } from '../../contextProviders/AuthProvider.tsx';
import { WishlistToolbar } from '../UserAccount/Wishlist/WishlistToolbar';

const Header = () => {
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { isLoggedIn, user, login, logout } = useAuth();

  const handleSearch = (searchTerm) => {};

  const toggleThemePicker = () => {
    setShowThemePicker((prev) => !prev);
  };

  const handleUserAction = (event) => {
    window.location.href = `/${event}`;
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

            <div className="login-section">
              <Cart />
            </div>

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
