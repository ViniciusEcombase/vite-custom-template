import React from 'react';
import { useAuth } from '../../customHooks/useAuth';
import UserAuth from '../primitives/UserAuth';
import Button from '../primitives/Button';
import Header from '../composed/Header';

const Login = () => {
  const { isLoggedIn, user, login, logout } = useAuth();

  return (
    <>
      <Header />
      <div className="header-actions">
        <Button text="Fazer login" onClick={login} />
      </div>
    </>
  );
};

export default Login;
