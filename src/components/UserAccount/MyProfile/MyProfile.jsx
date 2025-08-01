import { useState, useEffect, useCallback, useMemo } from 'react';
import Input from '../../Input/Input';
import Button from '../../Button/Button';
import Form from '../../Form/Form';
import useFetch from '../../../customHooks/useFetch';
import { useModalActions } from '../../../contextProviders/ModalProvider';
import { useAuth } from '../../../contextProviders/AuthProvider';

// Constants
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

const FORM_CONFIG_URL = 'editCustomerForm.json';
const NON_EDITABLE_FIELDS = ['email', 'cpf_cnpj'];

const MyProfile = () => {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const { openModal, closeModal, showAlert } = useModalActions();
  const [editForm, setEditForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = useFetch(API_CONFIG);
  const formFetch = useFetch();

  // Memoize form data with initial values
  const formWithInitialValues = useMemo(() => {
    if (!editForm || !user) return [];

    return editForm.map((item) => ({
      ...item,
      initialValue: user[item.id] ?? '',
      disabled: NON_EDITABLE_FIELDS.includes(item.id),
    }));
  }, [editForm, user]);

  // Load form configuration on mount
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
          console.error('Error fetching form config:', err);
          setError('Failed to load form configuration');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFormConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (values) => {
      try {
        if (!user?.user_id) throw new Error('User ID is missing');

        const response = await api.patch(
          `/customers?user_id=eq.${user.user_id}`,
          values
        );

        if (response.ok && response.data?.[0]) {
          const updatedCustomer = response.data[0];

          await refreshUser();
          await refreshUser(updatedCustomer);

          showAlert({
            title: 'Success!',
            message: 'Your information was successfully updated!',
          });

          closeModal();
        } else {
          throw new Error(response.error || 'Failed to update profile');
        }

        return response;
      } catch (err) {
        console.error('Error updating profile:', err);
        showAlert({
          title: 'Error',
          message:
            err.message ||
            'Failed to update your information. Please try again.',
          type: 'error',
        });
        throw err;
      }
    },
    [api, user?.user_id, refreshUser, showAlert, closeModal]
  );

  // Handle edit button click
  const handleEditClick = useCallback(() => {
    if (!formWithInitialValues.length) {
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
            label="Edit Profile Information"
            formData={formWithInitialValues}
            onSubmit={handleFormSubmit}
            showCancel={true}
            onCancel={closeModal}
          />
        </div>
      </div>
    );
  }, [
    formWithInitialValues,
    openModal,
    closeModal,
    handleFormSubmit,
    showAlert,
  ]);

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="content-area animate-fade-in">
        <div className="content-header">
          <h2 className="content-title">My Profile</h2>
          <p className="content-subtitle">Managing your personal information</p>
        </div>

        <div className="profile-loading">
          <div className="profile-loading-spinner"></div>
          <p className="profile-loading-text">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="content-area animate-fade-in">
        <div className="content-header">
          <h2 className="content-title">My Profile</h2>
          <p className="content-subtitle">Managing your personal information</p>
        </div>

        <div className="profile-error">
          <div className="profile-error-icon">⚠</div>
          <h3 className="profile-error-title">Unable to Load Profile</h3>
          <p className="profile-error-message">
            {error ||
              'There was an issue loading your profile information. Please try refreshing the page.'}
          </p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="content-area animate-fade-in">
      <div className="content-header">
        <h2 className="content-title">My Profile</h2>
        <p className="content-subtitle">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="profile-form">
        <div className="profile-section animate-slide-in">
          <h3>Personal Information</h3>
          <div className="form-grid">
            {editForm?.map((item) => (
              <div
                key={item.id}
                className={`form-group ${
                  NON_EDITABLE_FIELDS.includes(item.id) ? 'disabled' : ''
                }`}
                data-field-type={item.type}
              >
                <Input
                  initialValue={user[item.id] ?? ''}
                  type={item.type}
                  disabled={true}
                  label={item.label}
                  id={item.id}
                />
              </div>
            ))}
          </div>

          <div className="profile-actions">
            <Button
              text="Edit Profile"
              onClick={handleEditClick}
              disabled={!editForm || editForm.length === 0}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
