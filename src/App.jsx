import React from 'react';
import { ModalProvider } from './contextProviders/ModalProvider';
import SignUp from './components/pages/SignUp';
import Home from './components/pages/Home';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <ModalProvider>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </ModalProvider>
    </BrowserRouter>
  );
};

export default App;
