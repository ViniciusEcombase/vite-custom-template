import React, { useState } from 'react';
import Logo from '../Logo/Logo';
import ChangeTheme from '../ChangeTheme/ChangeTheme';
import { useAuth } from '../../contextProviders/AuthProvider';

const CheckoutHeader = () => {
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
        <div className="container header-checkout-container">
          <Logo variant="main" />
          <ChangeTheme
            showThemePicker={showThemePicker}
            toggleThemePicker={toggleThemePicker}
          />
        </div>
      </header>
    </>
  );
};

export default CheckoutHeader;
