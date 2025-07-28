import { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import MyProfile from '../composed/MyProfile';
import MyOrders from '../composed/MyOrders';
import Wishlist from '../composed/Wishlist';
import Settings from '../composed/Settings';
import Header from '../composed/Header';
import MyAddresses from '../composed/MyAddresses';

const UserAccount = () => {

  const [activeSection, setActiveSection] = useState('profile');

  const navigationItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: Lucide.User,
      component: MyProfile,
    },
    {
      id: 'addresses',
      label: 'My Addresses',
      icon: Lucide.MapPin,
      component: MyAddresses,
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: Lucide.Package,
      component: MyOrders,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Lucide.Heart,
      component: Wishlist,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Lucide.Settings,
      component: Settings,
    },
  ];

  useEffect(() => {
    const loadFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section');
      if (section && navigationItems.find((item) => item.id === section)) {
        setActiveSection(section);
      }
    };

    loadFromURL();

    const handlePopState = () => {
      loadFromURL();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('section', activeSection);
    window.history.pushState({}, '', url);
  }, [activeSection]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const ActiveComponent =
    navigationItems.find((item) => item.id === activeSection)?.component ||
    MyProfile;

  return (
    <>
      <Header />
      <div className="user-account-container">
        <main className="user-account-content">
          <div className="user-account-layout">
            <nav className="nav-sidebar">
              <h2>Account Menu</h2>
              <ul className="nav-menu">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.id} className="nav-menu-item">
                      <button
                        className={`nav-menu-button ${
                          activeSection === item.id ? 'active' : ''
                        }`}
                        onClick={() => handleSectionChange(item.id)}
                      >
                        <IconComponent className="icon" />
                        <span>{item.label}</span>
                        <Lucide.ChevronRight
                          className="icon"
                          style={{ marginLeft: 'auto', opacity: 0.5 }}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="content-container">
              <ActiveComponent />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UserAccount;
