import { useEffect, useState } from 'react';
import { useModalActions } from '../../contextProviders/ModalProvider';
import Form from '../composed/Form';
import useFetch from '../../customHooks/useFetch';
import Header from '../composed/Header';
import { useAuth } from '../../contextProviders/AuthProvider';

const SignUp = () => {
  const { showAlert } = useModalActions(); // Comes from Context: ModalProvider
  const [currentStep, setCurrentStep] = useState(1); // Changes what is on display
  const [responseUser, setResponseUser] = useState(); // Saves the response of the User form
  const [responseCustomer, setResponseCustomer] = useState(); // Saves the response of the Customer form
  const [signUpFormCustomer, setSignUpFormCustomer] = useState(); //Customer form Input config
  const [signUpFormAddress, setSignUpFormAddress] = useState(); //Address form Input config
  const customerFormFetch = useFetch();
  const addressFormFetch = useFetch();
  const { fetchRequest } = useFetch(); // Comes from CustomHook: useFetch
  const [loginToSupabase, setLoginToSupabase] = useState();
  const { login } = useAuth(); // 👈 Add this

  useEffect(() => {
    const fetchLocalForm = async () => {
      const res = await customerFormFetch.get('signUpFormCustomer.json');
      setSignUpFormCustomer(res.data);
    };

    fetchLocalForm();
  }, []);

  useEffect(() => {
    const fetchLocalFormAddress = async () => {
      const res = await addressFormFetch.get('signUpFormAddress.json');
      setSignUpFormAddress(res.data);
    };

    fetchLocalFormAddress();
  }, []);

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
    setLoginToSupabase(supabaseUser);

    try {
      const resUser = await fetchRequest(
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

      const supabaseCustomer = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        cpf_cnpj: values.cpf,
        user_id: resUser.data.user.id,
      };

      const resCustomer = await fetchRequest(
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
    try {
      const supabaseCustomerAddress = {
        customer_id: responseCustomer.data[0].id,
        address_name: values.address_name,
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
      login(loginToSupabase.email, loginToSupabase.password);

      showAlert({
        title: '🎉 Welcome to Our Platform!',
        message: `Thank you ${responseCustomer.data[0].first_name}! Your registration is now complete. You will be redirected to the home page shortly.`,
        confirmText: 'Go to Home Page',
        showCountdown: true,
        countdownDuration: 6,
        countdownUrgency: 'normal',
        onClose: redirectToHome,
        onCountdownComplete: redirectToHome,
      });
    } catch (error) {
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
      <Header />
      {currentStep === 1 && signUpFormCustomer && (
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
              formData={signUpFormCustomer}
              onSubmit={handleCustomerFormSubmit}
            />
          </div>
        </div>
      )}
      {currentStep === 2 && signUpFormAddress && (
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
              formData={signUpFormAddress}
              onSubmit={handleAddressFormSubmit}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SignUp;
