import { useEffect, useState } from 'react';
import { useModalActions } from '../../contextProviders/ModalProvider';
import Form from '../composed/Form';
import useFetch from '../../customHooks/useFetch';

const SignUp = () => {
  const { fetchRequest } = useFetch(); // Comes from CustomHook: useFetch
  const { showAlert } = useModalActions(); // Comes from Context: ModalProvider
  const [currentStep, setCurrentStep] = useState(1); // Changes what is on display
  const [responseUser, setResponseUser] = useState(); // Saves the response of the User form
  const [responseCustomer, setResponseCustomer] = useState(); // Saves the response of the Customer form
  const [responseAddress, setResponseAddress] = useState(); // Saves the response of the Address form

  // Array of inputs for the Customer/User form
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

  // Array of inputs for the Address form
  const formAddressConfig = [
    {
      id: 'postal_code',
      label: 'Postal Code',
      type: 'text',
      validations: [
        { type: 'required', message: 'Postal Code is required' },
        {
          type: 'regex',
          pattern: 'postal_code',
          message: 'Invalid Postal Code',
        },
      ],
    },
    {
      id: 'number',
      label: 'Number',
      type: 'text',
      validations: [{ type: 'required', message: 'Number is required' }],
    },
    {
      id: 'complement',
      label: 'Complement',
      type: 'text',
    },
    {
      id: 'street',
      label: 'Street',
      type: 'text',
      validations: [{ type: 'required', message: 'Street is required' }],
    },
    {
      id: 'district',
      label: 'District',
      type: 'text',
      validations: [{ type: 'required', message: 'District is required' }],
    },
    {
      id: 'city',
      label: 'City',
      type: 'text',
      validations: [{ type: 'required', message: 'City is required' }],
    },
    {
      id: 'state',
      label: 'State',
      type: 'text',
      validations: [{ type: 'required', message: 'State is required' }],
    },
    {
      id: 'country',
      label: 'Country',
      type: 'text',
      validations: [{ type: 'required', message: 'Country is required' }],
    },
  ];

  // Helper function to handle redirects
  const redirectToHome = () => {
    window.location.href = '/';
  };

  // Handles the Customer Form submit
  const handleCustomerFormSubmit = async (values) => {
    const supabaseUser = {
      email: values.email,
      password: values.password,
    };

    try {
      const resUser = await fetchRequest(
        // Signup user in supabase
        'https://niihlyofonxtmzgzanpv.supabase.co/auth/v1/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk',
            Accept: 'application/json',
            apikey:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk',
          },
          body: JSON.stringify(supabaseUser),
        }
      );
      setResponseUser(resUser);

      const supabaseCustomer = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        cpf_cnpj: values.cpf,
        user_id: resUser.json.user.id,
      };

      const resCustomer = await fetchRequest(
        // Signup customer in supabase
        'https://niihlyofonxtmzgzanpv.supabase.co/rest/v1/customers',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk',
            Accept: 'application/json',
            apikey:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(supabaseCustomer),
        }
      );
      setResponseCustomer(resCustomer);

      // Enhanced modal with countdown for step transition
      showAlert({
        title: '✅ Account Created Successfully!',
        message:
          "Your account has been created. Let's complete your profile by adding your address information.",
        confirmText: 'Continue to Address',
        showCountdown: true,
        countdownDuration: 20,
        countdownUrgency: 'normal',
        onClose: () => setCurrentStep(2),
        onCountdownComplete: () => setCurrentStep(2),
      });
    } catch (error) {
      // Error handling with alert modal
      showAlert({
        title: '❌ Registration Failed',
        message:
          'There was an error creating your account. Please try again or contact support if the problem persists.',
        confirmText: 'Try Again',
        onClose: () => {
          console.error('Registration error:', error);
        },
      });
    }
  };

  // Handles the Address Form submit
  const handleAddressFormSubmit = async (values) => {
    console.log(values);

    try {
      const supabaseCustomerAddress = {
        customer_id: responseCustomer.json[0].id,
        street: values.street,
        district: values.district,
        city: values.city,
        state: values.state,
        postal_code: values.postal_code,
        country: values.country,
        is_default: true,
        number: values.number,
        complement: values.complement ? values.complement : '',
      };

      const resAddress = await fetchRequest(
        'https://niihlyofonxtmzgzanpv.supabase.co/rest/v1/customer_addresses',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk',
            Accept: 'application/json',
            apikey:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk',
          },
          body: JSON.stringify(supabaseCustomerAddress),
        }
      );

      setResponseAddress(resAddress);

      // Enhanced success modal with countdown and redirect
      showAlert({
        title: '🎉 Welcome to Our Platform!',
        message: `Thank you ${responseCustomer.json[0].first_name}! Your registration is now complete. You will be redirected to the home page shortly.`,
        confirmText: 'Go to Home Page',
        showCountdown: true,
        countdownDuration: 6,
        countdownUrgency: 'normal',
        onClose: redirectToHome,
        onCountdownComplete: redirectToHome,
      });
    } catch (error) {
      // Error handling for address submission
      showAlert({
        title: '❌ Address Registration Failed',
        message:
          "Your account was created successfully, but we couldn't save your address. You can add it later in your profile settings.",
        confirmText: 'Continue to Home',
        showCountdown: true,
        countdownDuration: 8,
        countdownUrgency: 'warning',
        onClose: redirectToHome,
        onCountdownComplete: redirectToHome,
      });
    }
  };

  return (
    <>
      {currentStep === 1 && (
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
              label="Create Your Account"
              formData={formConfig}
              onSubmit={handleCustomerFormSubmit}
            />
          </div>
        </div>
      )}
      {currentStep === 2 && (
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
              label="Add Your Address"
              formData={formAddressConfig}
              onSubmit={handleAddressFormSubmit}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SignUp;
