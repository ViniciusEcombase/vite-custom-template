import React, { useState, useEffect } from 'react';
import Input from '../primitives/Input';
import useFetch from '../../customHooks/useFetch';
import Button from '../primitives/Button';
import { useModalActions } from '../../contextProviders/ModalProvider';
import Form from './Form';

const MyProfile = () => {
  const { showAlert, openModal } = useModalActions();
  const [editForm, setEditForm] = useState();
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    whatsapp: '51 997674724',
    phone: '+1 (555) 123-4567',
    cpf: '05027350074',
  });
  const customerFormFetch = useFetch();

  useEffect(() => {
    const fetchLocalForm = async () => {
      const res = await customerFormFetch.get('editCustomerForm.json');
      setEditForm(res.data);
    };

    fetchLocalForm();
  }, []);

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  function handleEditClick() {
    function handleAddressFormSubmit() {
      console.log('deu cert!');
    }
    openModal(
      <div className="container">
        <div className="container container-sm">
          <Form
            label="Change info"
            formData={editForm}
            onSubmit={handleAddressFormSubmit}
          />
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
              editForm.map((item) => {
                return (
                  <Input
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
