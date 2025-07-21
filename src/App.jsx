import React from 'react';
import Form from './Components/Form';
import img from './assets/images/img.jpg';
import DogSvg from './assets/svg/DogSvg';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const objetos = [
  {
    id: 'name',
    label: 'Nome',
    type: 'text',
    required: true,
    validations: [
      { type: 'required', message: 'Name is required' },
      { type: 'minLength', value: 2, message: 'Minimum 2 characters' },
      { type: 'maxLength', value: 16, message: 'Maximum 16 characters' },
      {
        type: 'regex',
        pattern: 'username',
        message: 'Only letters, numbers, and underscores',
      },
    ],
  },
  {
    id: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    validations: [
      { type: 'required', message: 'Password is required' },
      { type: 'minLength', value: 3, message: 'Minimum 3 characters' },
      { type: 'maxLength', value: 16, message: 'Maximum 16 characters' },
      {
        type: 'regex',
        pattern: 'strongPassword',
        message: 'Needs: Special symbol, Uppercase, LowerCase',
      },
    ],
  },
];

const App = () => {
  return (
    <>
      <DogSvg />

      <div style={{ marginTop: '100px' }} className="container">
        <Form validation={objetos} formData={objetos} />
        <img src={img} alt="" />
      </div>
      {/* <Select /> */}
    </>
  );
};

export default App;
