import React from 'react';
import Form from './components/composed/Form';
import img from './assets/images/img.jpg';
import DogSvg from './assets/svg/DogSvg';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Overlay from './components/primitives/Overlay';
import Modal from './components/primitives/Modal';
import { ModalProvider } from './contextProviders/ModalProvider';
import Home from './Home';

const App = () => {
  return (
    <>
      <ModalProvider>
        <Home />
      </ModalProvider>
    </>
  );
};

export default App;
