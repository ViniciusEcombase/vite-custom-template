import React, { useState } from 'react';
import { useClickOutside } from '../../customHooks/useClickOutside';

const UserIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);

const UserMenu = ({ user, onUserAction, onLogout, isLoggedIn }) => {
  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: 'user' },
    { id: 'orders', label: 'My Orders', icon: 'clipboard' },
    { id: 'wishlist', label: 'Wishlist', icon: 'heart' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const MenuItemsRegister = [
    { id: 'Login', label: 'Login', icon: 'login' },
    { id: 'SignUp', label: 'Register', icon: 'register' },
  ];

  const getIcon = (iconType) => {
    const icons = {
      user: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>,
      clipboard: (
        <>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </>
      ),
      heart: (
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      ),
      settings: (
        <>
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </>
      ),
      login: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M20.944 18.432a2.577 2.577 0 0 1-2.729 2.5c-2.153.012-4.307 0-6.46 0a.5.5 0 0 1 0-1c2.2 0 4.4.032 6.6 0c1.107-.016 1.589-.848 1.589-1.838V5.63a1.545 1.545 0 0 0-.969-1.471a3 3 0 0 0-1.061-.095h-6.159a.5.5 0 0 1 0-1c2.225 0 4.465-.085 6.688 0a2.566 2.566 0 0 1 2.5 2.67Z"
          />
          <path
            fill="currentColor"
            d="M15.794 12.354a.46.46 0 0 0 .138-.312l.006-.042l-.006-.041a.46.46 0 0 0-.138-.313l-3.669-3.668a.5.5 0 0 0-.707.707l2.816 2.815H3.492a.5.5 0 0 0 0 1h10.742l-2.816 2.815a.5.5 0 0 0 .707.707Z"
          />
        </svg>
      ),
      register: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M15 14c-2.67 0-8 1.33-8 4v2h16v-2c0-2.67-5.33-4-8-4m-9-4V7H4v3H1v2h3v3h2v-3h3v-2m6 2a4 4 0 0 0 4-4a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4"
          />
        </svg>
      ),
    };
    return icons[iconType];
  };

  return (
    <div className="user-menu">
      {isLoggedIn
        ? menuItems
        : MenuItemsRegister.map((item) => (
            <button
              key={item.id}
              className="user-menu-item"
              onClick={() => onUserAction(item.id)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginRight: '8px' }}
              >
                {getIcon(item.icon)}
              </svg>
              {item.label}
            </button>
          ))}
      {isLoggedIn && (
        <button
          className="user-menu-item"
          onClick={onLogout}
          style={{ color: 'var(--color-error)' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginRight: '8px' }}
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16,17 21,12 16,7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>
      )}
    </div>
  );
};

const UserAuth = ({ isLoggedIn, user, onLogin, onLogout, onUserAction }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useClickOutside(() => setShowUserMenu(false));

  const handleLogin = () => {
    onLogin();
  };

  const handleUserAction = (action) => {
    onUserAction(action);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowUserMenu(false);
  };

  const handleClick = () => {};

  if (!isLoggedIn) {
    return (
      <button className="login-btn" onClick={handleLogin}>
        <UserIcon />
        <span>Login / Register</span>
      </button>
    );
  }

  return (
    <>
      <div className="user-menu-container" ref={menuRef}>
        <button
          className="user-menu-btn"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <UserIcon />
          <span>{user?.name || 'User'}</span>
          <ChevronDownIcon />
        </button>

        {showUserMenu && (
          <div className="user-menu-wrapper">
            {/* 👇 This is your dropdown */}
            <UserMenu
              user={user}
              onUserAction={handleUserAction}
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default UserAuth;
