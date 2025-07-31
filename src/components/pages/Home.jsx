import React from 'react';
import Header from '../composed/Header';
import ChangeTheme from '../primitives/ChangeTheme';

const Home = () => {
  return (
    <>
      <Header />
      <div className="container">
        <h1>Essa é a home!!!</h1>
        <h1>Aqui vão ter coisas da home...</h1>
        <h1>Tipo produtos</h1>
        <h1>Banners</h1>
        <h1>Promoções etc</h1>
      </div>
    </>
  );
};

export default Home;
