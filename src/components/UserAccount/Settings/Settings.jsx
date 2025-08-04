import React, { useState, useEffect } from 'react';
import { User, Package, Heart, ChevronRight, MapPin } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    twoFactorAuth: false,
    publicProfile: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="content-area">
      <div className="content-header">
        <h2 className="content-title">Settings</h2>
        <p className="content-subtitle">Manage your account preferences</p>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="settings-option">
            <div className="settings-option-info">
              <h4>Email Notifications</h4>
              <p>Receive order updates and important notifications via email</p>
            </div>
            <div
              className={`toggle-switch ${
                settings.emailNotifications ? 'active' : ''
              }`}
              onClick={() => toggleSetting('emailNotifications')}
            />
          </div>

          <div className="settings-option">
            <div className="settings-option-info">
              <h4>Push Notifications</h4>
              <p>Get real-time notifications on your device</p>
            </div>
            <div
              className={`toggle-switch ${
                settings.pushNotifications ? 'active' : ''
              }`}
              onClick={() => toggleSetting('pushNotifications')}
            />
          </div>

          <div className="settings-option">
            <div className="settings-option-info">
              <h4>Marketing Emails</h4>
              <p>Receive promotional offers and product updates</p>
            </div>
            <div
              className={`toggle-switch ${
                settings.marketingEmails ? 'active' : ''
              }`}
              onClick={() => toggleSetting('marketingEmails')}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Security</h3>
          <div className="settings-option">
            <div className="settings-option-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security to your account</p>
            </div>
            <div
              className={`toggle-switch ${
                settings.twoFactorAuth ? 'active' : ''
              }`}
              onClick={() => toggleSetting('twoFactorAuth')}
            />
          </div>

          <div className="settings-option">
            <div className="settings-option-info">
              <h4>Change Password</h4>
              <p>Update your account password</p>
            </div>
            <button className="btn btn-secondary">Change</button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Privacy</h3>
          <div className="settings-option">
            <div className="settings-option-info">
              <h4>Public Profile</h4>
              <p>Make your profile visible to other users</p>
            </div>
            <div
              className={`toggle-switch ${
                settings.publicProfile ? 'active' : ''
              }`}
              onClick={() => toggleSetting('publicProfile')}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Account Management</h3>
          <div className="settings-option">
            <div className="settings-option-info">
              <h4>Export Data</h4>
              <p>Download a copy of your account data</p>
            </div>
            <button className="btn btn-secondary">Export</button>
          </div>

          <div className="settings-option">
            <div className="settings-option-info">
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all data</p>
            </div>
            <button className="btn btn-danger">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
