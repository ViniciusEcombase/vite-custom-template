import React, { useState, useCallback } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import InputPassword from './InputPassword';

const Form = ({ formData }) => {
  const [form, setForm] = useState(() =>
    formData.reduce((acc, item) => {
      acc[item.id] = {ASDASDASDAS
        value: '',
        isValid: !item.required, // Start invalid if required
      };
      return acc;
    }, {})
  );

  const handleInput = useCallback(({ id, value, isValid }) => {
    setForm((prev) => ({
      ...prev,
      [id]: { value, isValid },
    }));
  }, []);

  const handleSubmit = (event) => {
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
        {formData.map((fieldConfig) => (
          <Input
            key={fieldConfig.id}
            id={fieldConfig.id}
            label={fieldConfig.label}
            type={fieldConfig.type}
            validations={fieldConfig.validations}
            onInputChange={handleInput}
            placeholder={`Enter your ${fieldConfig.label.toLowerCase()}`}
            showPasswordRequirements={fieldConfig.type === 'password'}
          />
        ))}
      </div>
      <Button disabled={!isFormValid} onClick={handleSubmit} text="Enviar" />
    </form>
  );
};

export default Form;
