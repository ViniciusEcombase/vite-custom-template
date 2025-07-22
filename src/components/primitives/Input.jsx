import React, { useState, useImperativeHandle, forwardRef } from 'react';
import useFieldValidation from '../../customHooks/useFieldValidation';
import PasswordRequirements from './PasswordRequirements';

const Input = forwardRef(
  (
    {
      id,
      label,
      type = 'text',
      placeholder = 'Enter value',
      initialValue = '',
      validations = [],
      showPasswordRequirements = false,
    },
    ref
  ) => {
    const [showRequirements, setShowRequirements] = useState(false);

    const field = useFieldValidation(initialValue, validations);

    // Expose validation method to parent
    useImperativeHandle(
      ref,
      () => ({
        validate: field.validate,
        getValue: () => field.value,
        getIsValid: () => field.isValid,
        setValue: field.setValue,
      }),
      [field.validate, field.value, field.isValid, field.setValue]
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
      // Keep requirements visible if password is invalid or empty
      if (showPasswordRequirements) {
        setShowRequirements(!field.isValid || field.value.length === 0);
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
  }
);

Input.displayName = 'Input';

export default Input;
