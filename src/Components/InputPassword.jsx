import React, { useState, useCallback, useEffect } from 'react';
import PasswordRequirements from './PasswordRequirements';

const InputPassword = ({
  id,
  label,
  required,
  onInputChange,
  placeholder = 'Enter your password',
  initialValue = '',
  className = 'form-input',
  validation,
  ...props
}) => {
  const [data, setData] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  useEffect(() => {
    setData(initialValue);
  }, [initialValue]);

  // Validation function (same as Input component)
  const validateField = useCallback(
    (value, fieldId) => {
      console.log(value, fieldId);

      // Find validation rules for this field
      const fieldValidation = validation.find((item) => {
        return item.id === fieldId;
      });

      if (!fieldValidation || !fieldValidation.validations) {
        return { isValid: true, error: '' };
      }

      // Check each validation rule
      for (const rule of fieldValidation.validations) {
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
    },
    [validation]
  );

  const handleChange = useCallback(
    (event) => {
      const value = event.target.value;
      setData(value);

      // Only validate if field has been touched
      if (touched) {
        const validationResult = validateField(value, id);
        setIsValid(validationResult.isValid);
        setError(validationResult.error);

        // Call parent's onChange with validation result
        onInputChange({ id, value, isValid: validationResult.isValid });
      } else {
        // Call parent's onChange without validation on first change
        onInputChange({ id, value, isValid: true });
      }
    },
    [id, onInputChange, touched, validateField]
  );

  const handleFocus = useCallback(() => {
    setShowRequirements(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTouched(true);

    // Validate on blur
    const validationResult = validateField(data, id);
    setIsValid(validationResult.isValid);
    setError(validationResult.error);

    // Update parent with validation result
    onInputChange({ id, value: data, isValid: validationResult.isValid });

    // Keep requirements visible if password is not valid
    if (validationResult.isValid) {
      setShowRequirements(false);
    }
  }, [id, data, onInputChange, validateField]);

  const getInputClass = () => {
    let classes = 'form-input';
    if (touched) {
      classes += isValid ? ' valid-password' : ' invalid-password';
    }
    return classes;
  };

  return (
    <div className="form-input-password">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="password"
        value={data}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={getInputClass()}
        {...(required ? { required } : {})}
        {...props}
      />
      {touched && error && <span className="vini-error">{error}</span>}
      <PasswordRequirements password={data} isVisible={showRequirements} />
    </div>
  );
};

export default InputPassword;
