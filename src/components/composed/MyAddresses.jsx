import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useModalActions } from '../../contextProviders/ModalProvider';

const MyAddresses = () => {
  const { openModal } = useModalActions(); // Comes from Context: ModalProvider

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'home',
      isDefault: true,
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
    },
    {
      id: 2,
      type: 'work',
      isDefault: false,
      firstName: 'John',
      lastName: 'Doe',
      address: '456 Business Ave',
      apartment: 'Suite 200',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'United States',
      phone: '+1 (555) 987-6543',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [newAddress, setNewAddress] = useState({
    type: 'home',
    isDefault: false,
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  const handleInputChange = (field, value) => {
    if (editingAddress) {
      setEditingAddress((prev) => ({ ...prev, [field]: value }));
    } else {
      setNewAddress((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveAddress = () => {
    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id ? editingAddress : addr
        )
      );
      setEditingAddress(null);
    } else {
      const id = Math.max(...addresses.map((a) => a.id), 0) + 1;
      setAddresses((prev) => [...prev, { ...newAddress, id }]);
      setNewAddress({
        type: 'home',
        isDefault: false,
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
      });
      setShowAddForm(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddForm(false);
  };

  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const currentForm = editingAddress || newAddress;
  const isEditing = !!editingAddress;

  const handleEditClick = () => {
    openModal(<h1>Vini</h1>);
  };
  return (
    <div className="content-area">
      <div className="content-header">
        <h2 className="content-title">My Addresses</h2>
        <p className="content-subtitle">
          Manage your shipping and billing addresses
        </p>
      </div>

      <div className="addresses-container">
        {/* Existing Addresses */}
        <div className="addresses-list">
          {addresses.map((address) => (
            <div key={address.id} className="address-card">
              <div className="address-header">
                <div className="address-type">
                  <span className={`address-type-badge ${address.type}`}>
                    {address.type.charAt(0).toUpperCase() +
                      address.type.slice(1)}
                  </span>
                  {address.isDefault && (
                    <span className="default-badge">Default</span>
                  )}
                </div>
                <div className="address-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEditClick()}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDeleteAddress(address.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="address-content">
                <div className="address-name">
                  {address.firstName} {address.lastName}
                </div>
                <div className="address-details">
                  <div>{address.address}</div>
                  {address.apartment && <div>{address.apartment}</div>}
                  <div>
                    {address.city}, {address.state} {address.zipCode}
                  </div>
                  <div>{address.country}</div>
                  <div>{address.phone}</div>
                </div>
              </div>

              {!address.isDefault && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSetDefault(address.id)}
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Address Button */}
        {!showAddForm && !editingAddress && (
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <MapPin className="icon" />
            Add New Address
          </button>
        )}

        {/* Add/Edit Address Form */}
        {(showAddForm || editingAddress) && (
          <div className="address-form">
            <h3>{isEditing ? 'Edit Address' : 'Add New Address'}</h3>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Address Type</label>
                <select
                  className="form-input"
                  value={currentForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={currentForm.isDefault}
                    onChange={(e) =>
                      handleInputChange('isDefault', e.target.checked)
                    }
                    style={{ marginRight: 'var(--space-2)' }}
                  />
                  Set as default address
                </label>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentForm.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentForm.lastName}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                value={currentForm.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Apartment, suite, etc. (optional)
              </label>
              <input
                type="text"
                className="form-input"
                value={currentForm.apartment}
                onChange={(e) => handleInputChange('apartment', e.target.value)}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentForm.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State/Province</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentForm.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">ZIP/Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentForm.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Country</label>
                <select
                  className="form-input"
                  value={currentForm.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                >
                  <option value="">Select Country</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={currentForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="flex" style={{ gap: 'var(--space-4)' }}>
              <button className="btn btn-primary" onClick={handleSaveAddress}>
                {isEditing ? 'Update Address' : 'Save Address'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAddress(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAddresses;
