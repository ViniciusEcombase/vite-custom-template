import { useState, useEffect, useCallback } from 'react';
import Button from '../../Button/Button';
import Form from '../../Form/Form';
import CardAddress from './CardAddress';
import { useModalActions } from '../../../contextProviders/ModalProvider';
import { useAuth } from '../../../contextProviders/AuthProvider.tsx';
import useFetch from '../../../customHooks/useFetch';

const API_CONFIG = {
  baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
  timeout: 10000,
  retries: 0,
  cache: true,
  defaultHeaders: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Prefer: 'return=representation',
  },
};

const FORM_CONFIG_URL = 'editCustomerAddressForm.json';

const MyAddresses = () => {
  const { user, refreshUser } = useAuth();
  const { openModal, closeModal, showAlert, showConfirmDialog } =
    useModalActions();
  const [editForm, setEditForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = useFetch(API_CONFIG);
  const formFetch = useFetch();

  // Addresses come from AuthProvider user object
  const addresses = (user?.addresses || []).slice().sort((a, b) => {
    if (a.is_default === b.is_default) return 0;
    return a.is_default ? -1 : 1;
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

  // Load form configuration
  useEffect(() => {
    let isMounted = true;

    const fetchFormConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await formFetch.get(FORM_CONFIG_URL);

        if (isMounted) {
          if (response.ok && response.data) {
            setEditForm(response.data);
          } else {
            throw new Error('Failed to load form configuration');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load form configuration');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFormConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle adding new address
  const handleAddAddress = useCallback(
    async (values) => {
      try {
        const addressData = {
          ...values,
          customer_id: user.customer_id,
        };

        const response = await api.post('/customer_addresses', addressData);

        if (response.ok && response.data?.[0]) {
          const newAddress = response.data[0];

          // If no existing addresses, set this new one as default
          if ((user.addresses?.length ?? 0) === 0) {
            await api.patch(`/customer_addresses?id=eq.${newAddress.id}`, {
              is_default: true,
            });
          }

          // Refresh user to sync updated addresses
          await refreshUser();

          showAlert({
            title: 'Success!',
            message: 'Address added successfully!',
          });

          closeModal();
        } else {
          throw new Error(response.error || 'Failed to add address');
        }

        return response;
      } catch (err) {
        showAlert({
          title: 'Error',
          message: err.message || 'Failed to add address. Please try again.',
          type: 'error',
        });
        throw err;
      }
    },
    [api, user.customer_id, user.addresses, showAlert, closeModal, refreshUser]
  );

  // Handle editing address
  const handleEditAddress = useCallback(
    async (values, addressId) => {
      try {
        const response = await api.patch(
          `/customer_addresses?id=eq.${addressId}`,
          values
        );

        if (response.ok && response.data?.[0]) {
          // Sync by refreshing user data from context
          await refreshUser();

          showAlert({
            title: 'Success!',
            message: 'Address updated successfully!',
          });

          closeModal();
        } else {
          throw new Error(response.error || 'Failed to update address');
        }

        return response;
      } catch (err) {
        showAlert({
          title: 'Error',
          message: err.message || 'Failed to update address. Please try again.',
          type: 'error',
        });
        throw err;
      }
    },
    [api, showAlert, closeModal, refreshUser]
  );

  // Handle deleting address
  const handleDeleteAddress = useCallback(
    async (addressId) => {
      showConfirmDialog({
        title: 'Are you sure?',
        message: 'This will permanently delete this address',
        onConfirm: async () => {
          try {
            const response = await api.delete(
              `/customer_addresses?id=eq.${addressId}`
            );

            if (response.ok) {
              // Sync by refreshing user data from context
              await refreshUser();

              showAlert({
                title: 'Success!',
                message: 'Address deleted successfully!',
              });
            } else {
              throw new Error(response.error || 'Failed to delete address');
            }
          } catch (err) {
            showAlert({
              title: 'Error',
              message:
                err.message || 'Failed to delete address. Please try again.',
              type: 'error',
            });
          }
        },
      });
    },
    [api, showAlert, refreshUser]
  );

  // Handle setting default address
  const handleSetDefault = useCallback(
    async (addressId) => {
      try {
        // Remove default flag from all addresses
        await api.patch(
          `/customer_addresses?customer_id=eq.${user.customer_id}`,
          {
            is_default: false,
          }
        );

        // Set selected address as default
        const response = await api.patch(
          `/customer_addresses?id=eq.${addressId}`,
          { is_default: true }
        );

        if (response.ok) {
          // Sync by refreshing user data from context
          await refreshUser();

          showAlert({
            title: 'Success!',
            message: 'Default address updated successfully!',
          });
        } else {
          throw new Error(response.error || 'Failed to set default address');
        }
      } catch (err) {
        showAlert({
          title: 'Error',
          message:
            err.message || 'Failed to set default address. Please try again.',
          type: 'error',
        });
      }
    },
    [api, user?.user_id, showAlert, refreshUser]
  );

  // Handle new address modal
  const handleNewAddress = useCallback(() => {
    if (!editForm?.length) {
      showAlert({
        title: 'Error',
        message: 'Form configuration not loaded. Please try again.',
        type: 'error',
      });
      return;
    }

    openModal(
      <div className="container">
        <div className="container container-sm" style={{ padding: '1rem' }}>
          <Form
            columns={2}
            label="Add New Address"
            formData={editForm}
            onSubmit={handleAddAddress}
            showCancel={true}
            onCancel={closeModal}
          />
        </div>
      </div>
    );
  }, [editForm, openModal, closeModal, handleAddAddress, showAlert]);

  // Handle edit address modal
  const handleEditClick = useCallback(
    (address) => {
      if (!editForm?.length) {
        showAlert({
          title: 'Error',
          message: 'Form configuration not loaded. Please try again.',
          type: 'error',
        });
        return;
      }

      // Prepare form data with initial values
      const formWithInitialValues = editForm.map((item) => ({
        ...item,
        initialValue: address[item.id] || '',
      }));

      openModal(
        <div className="container">
          <div className="container container-sm" style={{ padding: '1rem' }}>
            <Form
              columns={2}
              label="Edit Address"
              formData={formWithInitialValues}
              onSubmit={(values) => handleEditAddress(values, address.id)}
              showCancel={true}
              onCancel={closeModal}
            />
          </div>
        </div>
      );
    },
    [editForm, openModal, closeModal, handleEditAddress, showAlert]
  );

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-area">
        <div className="content-header">
          <h2 className="content-title">My Addresses</h2>
          <p className="content-subtitle">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="content-header">
        <h2 className="content-title">My Addresses</h2>
        <p className="content-subtitle">
          Manage your shipping and billing addresses
        </p>
      </div>

      {addresses.length > 0 ? (
        <div className="addresses-list">
          {addresses.map((address) => (
            <CardAddress
              key={address.id}
              address={address}
              onEdit={handleEditClick}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No addresses found. Add your first address to get started.</p>
        </div>
      )}

      <div className="addresses-container">
        <Button
          startIcon={mapIcon}
          text="Add New Address"
          onClick={handleNewAddress}
          disabled={!editForm || editForm.length === 0}
        />
      </div>
    </div>
  );
};

export default MyAddresses;
