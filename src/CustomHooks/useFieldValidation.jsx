import React, { useState, useCallback, useEffect, useMemo } from 'react';

const regexPatterns = {
  strongPassword:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{2,16}$/,
};

const useFieldValidation = (initialValue, validations, onValidationChange) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validateField = (value, validations) => {
    for (const rule of validations) {
      switch (rule.type) {
        case 'required':
          if (!value.trim()) {
            return { isValid: false, error: rule.message };
          }
          break;

        case 'minLength':
          if (value.length < rule.value) {
            return { isValid: false, error: rule.message };
          }
          break;

        case 'maxLength':
          if (value.length > rule.value) {
            return { isValid: false, error: rule.message };
          }
          break;

        case 'regex':
          const pattern =
            regexPatterns[rule.pattern] || new RegExp(rule.pattern);
          if (!pattern.test(value)) {
            return { isValid: false, error: rule.message };
          }
          break;

        default:
          break;
      }
    }
    return { isValid: true, error: '' };
  };

  // Validate immediately when value or validations change
  useEffect(() => {
    const result = validateField(value, validations);
    setIsValid(result.isValid);
    setError(result.error);

    // Always notify parent of current validity
    onValidationChange(result.isValid);
  }, [value, validations, onValidationChange]);

  const handleChange = useCallback((newValue) => {
    setValue(newValue);
  }, []);

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  return {
    value,
    error,
    touched,
    isValid,
    handleChange,
    handleBlur,
  };
};
export default useFieldValidation;
