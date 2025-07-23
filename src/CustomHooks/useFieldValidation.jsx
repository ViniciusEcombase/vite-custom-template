import { useState, useCallback, useEffect, useRef } from 'react';

const regexPatterns = {
  strongPassword:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{2,16}$/,
  postal_code: /^\d{5}-\d{3}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/,
};

const useFieldValidation = (initialValue = '', validations = []) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(() => {
    const hasRequired = validations.some((rule) => rule.type === 'required');
    return !(hasRequired && !initialValue?.toString().trim());
  });

  const mountedRef = useRef(true);
  const validationTimeoutRef = useRef(null);

  const validateField = useCallback(
    async (value, validations, formValues = {}) => {
      for (const rule of validations) {
        switch (rule.type) {
          case 'required':
            if (!value?.toString().trim()) {
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

          case 'min':
            if (Number(value) < rule.value) {
              return { isValid: false, error: rule.message };
            }
            break;

          case 'max':
            if (Number(value) > rule.value) {
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

          case 'url':
            try {
              new URL(value);
            } catch {
              return { isValid: false, error: rule.message };
            }
            break;

          case 'number':
            if (isNaN(value)) {
              return { isValid: false, error: rule.message };
            }
            break;

          case 'matches':
            console.log(formValues);
            if (value !== formValues[rule.fieldToMatch]) {
              return { isValid: false, error: rule.message };
            }
            break;

          case 'custom':
            if (!rule.validate(value, formValues)) {
              return { isValid: false, error: rule.message };
            }
            break;

          case 'async':
            const result = await rule.validate(value, formValues);
            if (!result) {
              return { isValid: false, error: rule.message };
            }
            break;

          default:
            console.warn(`Unknown validation rule type: ${rule.type}`);
            break;
        }
      }

      return { isValid: true, error: '' };
    },
    []
  );

  const runValidation = useCallback(
    async (currentValue, formValues = {}) => {
      if (!mountedRef.current) return;

      const result = await validateField(currentValue, validations, formValues);

      if (mountedRef.current) {
        setIsValid(result.isValid);
        setError(result.error);
      }

      return result;
    },
    [validateField, validations]
  );

  // ✅ Accept formValues here
  const handleChange = useCallback(
    (newValue, formValues = {}) => {
      setValue(newValue);

      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      validationTimeoutRef.current = setTimeout(() => {
        runValidation(newValue, formValues);
      }, 300);
    },
    [runValidation]
  );

  // ✅ Accept formValues here
  const handleBlur = useCallback(
    (formValues = {}) => {
      setTouched(true);
      runValidation(value, formValues);
    },
    [runValidation, value]
  );

  const validate = useCallback(
    (formValues = {}) => {
      return runValidation(value, formValues);
    },
    [runValidation, value]
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  return {
    value,
    error,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validate,
    setValue,
  };
};

export default useFieldValidation;
