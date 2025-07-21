import React from 'react';
import { useModal } from './contextProviders/ModalProvider';
import Modal from './components/primitives/Modal';

const Home = () => {
  const { openModal } = useModal();

  const handleOpen = () => {
    openModal(<Modal />);
  };

  return <button onClick={handleOpen}>Open Modal</button>;
};

export default Home;
