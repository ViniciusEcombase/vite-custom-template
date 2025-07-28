import { useState, useEffect } from 'react';
import { useAuth } from '../../contextProviders/AuthProvider';
import Header from '../composed/Header';
import useFetch from '../../customHooks/useFetch';
import Form from '../composed/Form';
import { useModalActions } from '../../contextProviders/ModalProvider';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { showAlert } = useModalActions(); // Comes from Context: ModalProvider
  const { login, register, error, loading, clearError, isLoggedIn } = useAuth();
  const [loginForm, setLoginForm] = useState();
  const customerFormFetch = useFetch();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocalForm = async () => {
      const res = await customerFormFetch.get('loginFormCustomer.json');
      setLoginForm(res.data);
    };

    fetchLocalForm();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      redirectToHome();
    }
  }, [isLoggedIn, navigate]);

  const redirectToHome = () => {
    window.location.href = '/';
  };

  const handleSubmit = async (values) => {
    clearError();

    const result = await login(values.email, values.password);
    if (result.success) {
      showAlert({
        title: 'Your login was sucessful!',
        message: `Thank you! You are now able to interact freely with the site.`,
        confirmText: 'Go to Home Page',
        showCountdown: true,
        countdownDuration: 6,
        countdownUrgency: 'normal',
        onClose: redirectToHome,
        onCountdownComplete: redirectToHome,
      });
    } else {
      showAlert({
        title: 'X Login failed',
        message:
          'We could not log you in, please verify your informations and try again',
        confirmText: 'OK',
        showCountdown: false,
      });
    }
  };

  return (
    <>
      <Header />
      {loginForm && (
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
            <Form label="Login" formData={loginForm} onSubmit={handleSubmit} />
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
