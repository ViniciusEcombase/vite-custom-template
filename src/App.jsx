import React from 'react';
import Form from './Components/Form';
import InputPassword from './Components/InputPassword';

const objetos2 = [];
const objetos = [
  {
    id: 'name',
    label: 'Nome',
    type: 'text',
    required: true,
    validations: [
      { type: 'required', message: 'Email is required' },
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
      <Form validation={objetos} formData={objetos} />
    </>
  );
};

export default App;
