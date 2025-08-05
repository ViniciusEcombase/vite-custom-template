// ===================================
// UPDATED LOGIN COMPONENT
// ===================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Form from '../components/Form/Form';
import useFetch from '../customHooks/useFetch';
import { useModalActions } from '../contextProviders/ModalProvider';
import { useAuth } from '../contextProviders/AuthProvider';

const Login = () => {
  const { showAlert } = useModalActions();
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
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        showAlert({
          title: '✅ Login Successful!',
          message: `Welcome back! You are now logged in and can access all features.`,
          confirmText: 'Go to Home Page',
          showCountdown: true,
          countdownDuration: 6,
          countdownUrgency: 'normal',
          onClose: redirectToHome,
          onCountdownComplete: redirectToHome,
        });
      } else {
        showAlert({
          title: '❌ Login Failed',
          message:
            'We could not log you in. Please verify your credentials and try again.',
          confirmText: 'Try Again',
          showCountdown: false,
        });
      }
    } catch (loginError) {
      showAlert({
        title: '❌ Login Error',
        message: 'An unexpected error occurred during login. Please try again.',
        confirmText: 'Try Again',
        showCountdown: false,
      });
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <>
      <Header />
      {loginForm && (
        <div className="container center" style={{ padding: 'var(--space-8)' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <Form
              label="Welcome Back"
              formData={loginForm}
              onSubmit={handleSubmit}
              variant="sectioned"
              columns={1}
              showCancel={false}
              onCancel={handleCancel}
            />

            {/* Additional login options */}
            <div
              className="form-section"
              style={{ marginTop: 'var(--space-6)' }}
            >
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-4)',
                  borderTop: '1px solid var(--color-gray-700)',
                }}
              >
                <p
                  className="text-sm text-secondary"
                  style={{ marginBottom: 'var(--space-3)' }}
                >
                  Don't have an account?
                </p>
                <a onClick={() => navigate('/signup')}>Create an account</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
