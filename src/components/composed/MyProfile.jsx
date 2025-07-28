import React, { useState, useEffect } from 'react';
import Input from '../primitives/Input';
import useFetch from '../../customHooks/useFetch';
import Button from '../primitives/Button';
import { useModalActions } from '../../contextProviders/ModalProvider';
import Form from './Form';
import { useAuth } from '../../contextProviders/AuthProvider';

const MyProfile = () => {
  const { user } = useAuth();
  const { openModal, closeModal } = useModalActions();
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
      Prefer: 'return=minimal',
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
    console.log(user);
    function handleAddressFormSubmit(values) {
      console.log(values);
      api.patch(
        `/customers?user_id=eq.984d07c3-2c20-4b2d-aa45-f8e276a0134d`,
        values
      );
    }

    const formWithInitialValues = editForm.map((item) => ({
      ...item,
      initialValue: user?.[item.id] || '',
      disabled: item.id === 'email' || item.id === 'cpf_cnpj',
    }));

    openModal(
      <div className="container">
        <div className="container container-sm">
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
