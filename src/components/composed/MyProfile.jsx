import React, { useState, useEffect } from 'react';
import Input from '../primitives/Input';
import useFetch from '../../customHooks/useFetch';
import Button from '../primitives/Button';
import { useModalActions } from '../../contextProviders/ModalProvider';
import Form from './Form';
import { useAuth } from '../../contextProviders/AuthProvider';

const MyProfile = () => {
  const { user, refreshUser, setUser } = useAuth();
  const { openModal, closeModal, showAlert } = useModalActions();
  const [editForm, setEditForm] = useState();
  const customerFormFetch = useFetch();

  // With configuration
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

  useEffect(() => {
    const fetchLocalForm = async () => {
      const res = await customerFormFetch.get('editCustomerForm.json');
      setEditForm(res.data);
    };

    fetchLocalForm();
  }, []);

  function handleEditClick() {
    async function handleAddressFormSubmit(values) {
      const res = await api.patch(
        `/customers?user_id=eq.${user.user_id}`,
        values
      );
      if (res.ok) {
        const updatedCustomer = res.data?.[0];

        // Optimistic UI update
        setUser((prev) => ({
          ...prev,
          ...updatedCustomer,
          updated_at: updatedCustomer.updated_at,
        }));

        // Inform refreshUser so it doesn't overwrite with stale data
        await refreshUser(updatedCustomer);

        showAlert({
          title: 'Success!',
          message: 'Your information was successfully updated!',
        });
      }

      return res;
    }

    const formWithInitialValues = editForm.map((item) => ({
      ...item,
      initialValue: user?.[item.id] || '',
      disabled: item.id === 'email' || item.id === 'cpf_cnpj',
    }));

    openModal(
      <div className="container">
        <div className="container container-sm" style={{ padding: '1rem' }}>
          <Form
            label="Change info"
            formData={formWithInitialValues}
            onSubmit={handleAddressFormSubmit}
          />

          <div style={{ paddingTop: '10px' }}>
            <Button
              size="md"
              variant="secondary"
              text="Cancel"
              onClick={closeModal}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="content-header">
        <h2 className="content-title">My Profile</h2>
        <p className="content-subtitle">Manage your personal information</p>
      </div>

      <div className="profile-form">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            {editForm &&
              user &&
              editForm.map((item) => {
                return (
                  <Input
                    initialValue={user[item.id]}
                    key={item.id}
                    type={item.type}
                    disabled={true}
                    label={item.label}
                    id={item.id}
                  />
                );
              })}
          </div>
        </div>

        <Button text="Edit" onClick={handleEditClick} />
      </div>
    </div>
  );
};

export default MyProfile;
