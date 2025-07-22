import React from 'react';
import { useModalActions } from './contextProviders/ModalProvider';
import Button from './components/primitives/Button';
import Form from './components/composed/Form';
import useFetch from './customHooks/useFetch';

const Home = () => {
  const { fetchRequest } = useFetch();
  const { showConfirmDialog, showAlert, openModal, closeModal } =
    useModalActions();

  // Example form configuration
  const formConfig = [
    {
      id: 'first_name',
      label: 'First Name',
      type: 'text',
      validations: [
        { type: 'required', message: 'First name is required' },
        {
          type: 'regex',
          pattern: 'username',
          message: 'Please enter a valid name',
        },
      ],
    },
    {
      id: 'last_name',
      label: 'Last Name',
      type: 'text',
      validations: [
        { type: 'required', message: 'Last name is required' },
        {
          type: 'regex',
          pattern: 'username',
          message: 'Please enter a valid name',
        },
      ],
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      validations: [
        { type: 'required', message: 'Email is required' },
        {
          type: 'regex',
          pattern: 'email',
          message: 'Please enter a valid email',
        },
      ],
    },
    {
      id: 'phone',
      label: 'Phone',
      type: 'text',
    },
    {
      id: 'cpf',
      label: 'Cpf',
      type: 'text',
      validations: [{ type: 'required', message: 'Cpf is required' }],
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      showPasswordRequirements: true,
      validations: [
        { type: 'required', message: 'Password is required' },
        {
          type: 'regex',
          pattern: 'strongPassword',
          message: 'Password must meet requirements',
        },
      ],
    },
    {
      id: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      showPasswordRequirements: false,
      validations: [
        { type: 'required', message: 'Please confirm your password' },
        {
          type: 'matches',
          fieldToMatch: 'password',
          message: 'Passwords do not match',
        },
      ],
    },
  ];

  const handleFormSubmit = async (values) => {
    const supabaseUser = {
      email: values.email,
      password: values.password,
    };

    const response = await fetchRequest(
      // Signup user in supabase
      'https://niihlyofonxtmzgzanpv.supabase.co/auth/v1/signup',
      {
        method: 'POST', // or 'POST', 'PUT', 'DELETE', etc.
        headers: {
          'Content-Type': 'application/json', // Specifies the type of content being sent
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk', // For authenticated requests
          Accept: 'application/json', // Specifies the type of content the client can accept
          apikey:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk',
          // Add other custom headers as needed
        },
        body: JSON.stringify(supabaseUser),
      }
    );
    console.log(response);
    const supabaseCustomer = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      cpf_cnpj: values.cpf,
      user_id: response.json.user.id,
    };
    await fetchRequest(
      // Signup customer in supabase
      'https://niihlyofonxtmzgzanpv.supabase.co/rest/v1/customers',
      {
        method: 'POST', // or 'POST', 'PUT', 'DELETE', etc.
        headers: {
          'Content-Type': 'application/json', // Specifies the type of content being sent
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk', // For authenticated requests
          Accept: 'application/json', // Specifies the type of content the client can accept
          apikey:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk',
          // Add other custom headers as needed
        },
        body: JSON.stringify(supabaseCustomer),
      }
    );

    console.log('Form submitted with values:', values);
    showAlert({
      title: 'Success',
      message: 'Form submitted successfully!',
    });
  };

  return (
    <div
      className="container"
      style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="container container-sm">
        <Form
          label="SignUp"
          formData={formConfig}
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  );
};

export default Home;
