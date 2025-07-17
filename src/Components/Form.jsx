import React, { useState, useCallback } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import InputPassword from './InputPassword';

const Form = ({ formData, validation }) => {
  const [form, setForm] = useState(
    formData.reduce((acc, item) => {
      acc[item.id] = { value: '', isValid: !item.required }; // Start invalid if required
      return acc;
    }, {})
  );

  const handleInput = useCallback(({ id, value, isValid }) => {
    console.log(id, value, isValid);

    setForm((prev) => ({
      ...prev,
      [id]: { value, isValid },
    }));
  }, []);

  const handleSubmit = () => {
    const allValid = Object.values(form).every((field) => field.isValid);

    if (allValid) {
      const formValues = Object.keys(form).reduce((acc, key) => {
        acc[key] = form[key].value;
        return acc;
      }, {});

      console.log('Form submitted successfully:', formValues);
      alert('Form submitted successfully!');
    } else {
      alert('Please fix validation errors before submitting');
    }
  };

  const isFormValid = Object.values(form).every((field) => field.isValid);

  return (
    <form>
      <div className="form-group">
        {formData.map(({ label, type, id }) => {
          let Component = type === 'password' ? InputPassword : Input;
          return (
            <Component
              key={id}
              id={id}
              label={label}
              validation={form}
              onInputChange={handleInput}
              placeholder={`Enter your ${label.toLowerCase()}`}
            />
          );
        })}
      </div>
      <Button onClick={handleSubmit} text="vini" />
    </form>
  );
};

export default Form;
