import React from 'react';
import { ModalProvider } from './contextProviders/ModalProvider';
import SignUp from './components/pages/SignUp';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import { AuthProvider } from './contextProviders/AuthProvider';
import PublicRoute from './components/routes/PublicRoute';
import UserAccount from './components/pages/UserAccount';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <Routes>
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route path="/" element={<Home />} />
            <Route path="/UserAccount" element={<UserAccount />} />
          </Routes>
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
