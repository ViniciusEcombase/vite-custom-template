import React, { useState, useCallback, useEffect } from 'react';
import useFieldValidation from '../CustomHooks/useFieldValidation';
import PasswordRequirements from './PasswordRequirements';

const Input = ({
  id,
  label,
  type = 'text',
  placeholder = 'Enter value',
  initialValue = '',
  validations = [],
  onInputChange,
  showPasswordRequirements = false,
}) => {
  const [showRequirements, setShowRequirements] = useState(false);

  const handleValidationChange = useCallback(
    (isValid) => {
      onInputChange({ id, value: field.value, isValid });
    },
    [id, onInputChange]
  );

  const field = useFieldValidation(
    initialValue,
    validations,
    handleValidationChange
  );

  const handleChange = (event) => {
    field.handleChange(event.target.value);
  };

  const handleFocus = () => {
    if (showPasswordRequirements) {
      setShowRequirements(true);
    }
  };

  const handleBlur = () => {
    field.handleBlur();
    if (showPasswordRequirements && field.isValid) {
      setShowRequirements(false);
    }
  };

  const getInputClass = () => {
    let classes = 'form-input';
    if (field.touched) {
      classes += field.isValid ? ' success' : ' error';
    }
    if (showPasswordRequirements && field.value.length > 0) {
      classes += field.isValid ? ' valid-password' : ' invalid-password';
    }
    return classes;
  };

  return (
    <div className={showPasswordRequirements ? 'form-input-password' : ''}>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={field.value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={getInputClass()}
      />
      {field.touched && field.error && (
        <span className="form-error">{field.error}</span>
      )}
      {showPasswordRequirements && (
        <PasswordRequirements
          password={field.value}
          isVisible={showRequirements}
        />
      )}
    </div>
  );
};

export default Input;
