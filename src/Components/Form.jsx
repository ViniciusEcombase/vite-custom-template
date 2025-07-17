import React, { useState } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';

const Form = ({ formData }) => {
  const [form, setForm] = useState(
    formData.reduce((acc, item) => {
      acc[item.id] = '';
      return acc;
    }, {})
  );

  // function handleSelect({ id, value }) {
  //   setForm({ ...form, [id]: value });
  // }

  function handleInput({ id, value }) {
    setForm({ ...form, [id]: value });
  }

  return (
    <form>
      <div className="form-group">
        {formData.map(({ label, type, id }) => {
          return (
            <Input
              key={id}
              onInputChange={handleInput}
              label={label}
              type={type}
              className="form-input"
              placeholder={`Enter your ${id}`}
            />
          );
        })}
      </div>
      <Button text="vini" />
    </form>
  );
};

export default Form;
