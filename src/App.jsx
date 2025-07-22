import React from 'react';
import { ModalProvider } from './contextProviders/ModalProvider';
import Home from './Home';

const App = () => {
  return (
    <ModalProvider>
      <Home />
    </ModalProvider>
  );
};

export default App;
