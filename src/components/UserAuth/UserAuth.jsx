import { useState } from 'react';
import Button from '../Button/Button';
import { useAuth } from '../../contextProviders/AuthProvider';
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

const LoadingSpinner = () => <div className="spinner spinner-sm"></div>;

const UserMenu = ({ user, onUserAction, onLogout, isLoggedIn }) => {
  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: 'myProfile' },
    { id: 'addresses', label: 'My Addresses', icon: 'map' },
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
      myProfile: (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20c0-3.333 2.667-6 6-6s6 2.667 6 6" />
        </>
      ),
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
        <>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
        </>
      ),
      register: (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </>
      ),
      map: (
        <>
          <path d="M12 21c-4-4-6-7-6-10a6 6 0 1 1 12 0c0 3-2 6-6 10z" />
          <circle cx="12" cy="11" r="2" />
        </>
      ),
    };

    return icons[iconType];
  };

  return (
    <div className="user-menu">
      {isLoggedIn
        ? menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="full-width"
              onClick={() => onUserAction(item.id)}
              text={item.label}
              startIcon={
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
              }
            />
          ))
        : MenuItemsRegister.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="full-width"
              onClick={() => onUserAction(item.id)}
              text={item.label}
              startIcon={
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
              }
            />
          ))}
      {isLoggedIn && (
        <Button
          key={'logout'}
          style={{ color: 'var(--color-error)' }}
          variant="ghost"
          size="full-width"
          onClick={onLogout}
          text={'Logout'}
          startIcon={
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
          }
        />
      )}
    </div>
  );
};

const UserAuth = ({ onUserAction }) => {
  const { user, isLoggedIn, logout, loading, session } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useClickOutside(() => setShowUserMenu(false));

  const handleUserAction = (action) => {
    const path =
      action === 'profile' ||
      action === 'addresses' ||
      action === 'orders' ||
      action === 'wishlist' ||
      action === 'settings'
        ? `/UserAccount?section=${action}`
        : `/${action}`;
    window.location.href = path;

    onUserAction?.(action);
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowUserMenu(false);
    } catch (error) {
    } finally {
      setIsLoggingOut(false);
      window.location.href = '/';
    }
  };

  // Show loading state only when initially loading or during critical operations
  if (loading && !session) {
    return <LoadingSpinner />;
  }

  // If we have a session but still loading user data, show a minimal loading state
  if (loading && session && !user && isLoggedIn) {
    return <LoadingSpinner />;
  }

  // Not logged in - show login/register menu
  if (!isLoggedIn || !session) {
    return (
      <div className="user-menu-container" ref={menuRef}>
        <button
          className="login-btn"
          onClick={() => setShowUserMenu(!showUserMenu)}
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : <UserIcon />}
          <span>Login / Register</span>
          <ChevronDownIcon />
        </button>

        {showUserMenu && (
          <div className="user-menu-wrapper">
            <UserMenu
              user={user}
              onUserAction={handleUserAction}
              onLogout={handleLogout}
              isLoggedIn={isLoggedIn}
            />
          </div>
        )}
      </div>
    );
  }

  // Logged in - show user menu
  const displayName = user?.first_name || 'User';

  return (
    <div className="user-menu-container" ref={menuRef}>
      <Button
        startIcon={isLoggingOut ? <LoadingSpinner /> : <UserIcon />}
        endIcon={<ChevronDownIcon />}
        onClick={() => setShowUserMenu(!showUserMenu)}
        variant="outline"
        size="sm"
        text={displayName}
      />

      {showUserMenu && (
        <div className="user-menu-wrapper">
          <UserMenu
            user={user}
            onUserAction={handleUserAction}
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}
    </div>
  );
};

export default UserAuth;
