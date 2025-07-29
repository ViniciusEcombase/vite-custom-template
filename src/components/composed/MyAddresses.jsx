import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useModalActions } from '../../contextProviders/ModalProvider';
import Button from '../primitives/Button';
import { useAuth } from '../../contextProviders/AuthProvider';
import useFetch from '../../customHooks/useFetch';

const MyAddresses = () => {
  const { user, refreshUser, setUser } = useAuth();
  const { openModal, closeModal, showAlert } = useModalActions();
  const [editForm, setEditForm] = useState();
  const EditCustomerAddressForm = useFetch();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const api = useFetch({
    baseURL: 'https://niihlyofonxtmzgzanpv.supabase.co/rest/v1',
    timeout: 10000,
    retries: 0,
    cache: true,
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk',
      apikey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk',
      Prefer: 'return=representation',
    },
  });

  const mapIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <rect width="24" height="24" fill="none" />
      <path
        fill="currentColor"
        d="M12 2C7.589 2 4 5.589 4 9.995C3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12c0-4.411-3.589-8-8-8m0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4"
      />
    </svg>
  );

  useEffect(() => {
    const fetchLocalForm = async () => {
      const res = await EditCustomerAddressForm.get(
        'editCustomerAddressForm.json'
      );
      setEditForm(res.data);
    };

    fetchLocalForm();
  }, []);

  useEffect(() => {
    if (!user?.id) return; // Wait until user is loaded

    const fetchCustomerAddresses = async () => {
      const res = await api.get(`/customer_information?user_id=eq.${user.id}`);
      if (res.ok) {
        console.log(res.data);
        setAddresses(res.data);
      } else {
        showAlert({
          type: 'error',
          message: 'Failed to fetch addresses.',
        });
      }
    };

    fetchCustomerAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(user?.id)]);

  return (
    <div className="content-area">
      <div className="content-header">
        <h2 className="content-title">My Addresses</h2>
        <p className="content-subtitle">
          Manage your shipping and billing addresses
        </p>
      </div>
      <div className="addresses-list">
        {addresses.map((address) => (
          <div key={address.id} className="address-card">
            <div className="address-header">
              <div className="address-type">
                {address.isDefault && (
                  <span className="default-badge">Default</span>
                )}
              </div>
              <div className="address-actions">
                <button className="btn-icon" onClick={() => handleEditClick()}>
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
      
      <div className="addresses-container">
        {!showAddForm && !editingAddress && (
          <Button startIcon={mapIcon} text="Add New Address" />
        )}
      </div>
    </div>
  );
};

export default MyAddresses;
