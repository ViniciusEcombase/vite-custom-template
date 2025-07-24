import React from 'react';
import Logo from '../primitives/Logo';
import SearchBar from '../primitives/SearchBar';
import UserAuth from '../primitives/UserAuth';
import Cart from '../primitives/Cart';
import { useAuth } from '../../customHooks/useAuth';
import { useCart } from '../../customHooks/useCart';
import Input from '../primitives/Input';

const Header = () => {
  const { isLoggedIn, user, login, logout } = useAuth();
  const {
    cartItems,
    cartTotal,
    cartItemCount,
    updateQuantity,
    removeFromCart,
    addToCart,
  } = useCart([
    { id: 1, name: 'Premium Wireless Headphones', price: 299.99, quantity: 2 },
    { id: 2, name: 'Smart Watch Series 8', price: 399.99, quantity: 1 },
    { id: 3, name: 'Wireless Charging Pad', price: 49.99, quantity: 1 },
  ]);

  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
  };

  const handleUserAction = (action) => {
    console.log('User action:', action);
    // TODO: Implement user actions (profile, orders, wishlist, settings)
  };

  const handleViewCart = () => {
    console.log('Viewing cart');
    // TODO: Navigate to cart page
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout');
    // TODO: Navigate to checkout page
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Logo />

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
            onViewCart={handleViewCart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
