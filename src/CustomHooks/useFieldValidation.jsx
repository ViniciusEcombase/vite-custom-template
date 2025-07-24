import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

const regexPatterns = {
  strongPassword:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{2,16}$/,
  postal_code: /^\d{5}-\d{3}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/,
  phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  date: /^\d{2}\/\d{2}\/\d{4}$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  creditCard: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
};

const useFieldValidation = (
  initialValue = '',
  validations = [],
  options = {}
) => {
  const {
    validateOn = 'both', // 'change', 'blur', 'both'
    debounceMs = 300,
    validateOnMount = false,
    transformValue = null,
  } = options;

  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(() => {
    const hasRequired = validations.some((rule) => rule.type === 'required');
    return !(hasRequired && !initialValue?.toString().trim());
  });

  const mountedRef = useRef(true);
  const validationTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Memoize validation rules to prevent unnecessary re-renders
  const memoizedValidations = useMemo(
    () => validations,
    [JSON.stringify(validations)]
  );

  const validateField = useCallback(
    async (value, validations, formValues = {}) => {
      // Cancel previous async validation if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        for (const rule of validations) {
          // Check if validation was aborted
          if (abortController.signal.aborted) {
            return { isValid: false, error: '', aborted: true };
          }

          const stringValue = value?.toString() || '';

          switch (rule.type) {
            case 'required':
              if (!stringValue.trim()) {
                return {
                  isValid: false,
                  error: rule.message || 'This field is required',
                };
              }
              break;

            case 'minLength':
              if (stringValue.length < rule.value) {
                return {
                  isValid: false,
                  error:
                    rule.message ||
                    `Minimum length is ${rule.value} characters`,
                };
              }
              break;

            case 'maxLength':
              if (stringValue.length > rule.value) {
                return {
                  isValid: false,
                  error:
                    rule.message ||
                    `Maximum length is ${rule.value} characters`,
                };
              }
              break;

            case 'min':
              const numValue = Number(value);
              if (isNaN(numValue) || numValue < rule.value) {
                return {
                  isValid: false,
                  error: rule.message || `Minimum value is ${rule.value}`,
                };
              }
              break;

            case 'max':
              const maxNumValue = Number(value);
              if (isNaN(maxNumValue) || maxNumValue > rule.value) {
                return {
                  isValid: false,
                  error: rule.message || `Maximum value is ${rule.value}`,
                };
              }
              break;

            case 'regex':
              const pattern =
                regexPatterns[rule.pattern] || new RegExp(rule.pattern);
              if (!pattern.test(stringValue)) {
                return {
                  isValid: false,
                  error:
                    rule.message ||
                    `Invalid format for ${rule.pattern || 'field'}`,
                };
              }
              break;

            case 'url':
              try {
                new URL(stringValue);
              } catch {
                return {
                  isValid: false,
                  error: rule.message || 'Please enter a valid URL',
                };
              }
              break;

            case 'number':
              if (stringValue && isNaN(Number(stringValue))) {
                return {
                  isValid: false,
                  error: rule.message || 'Please enter a valid number',
                };
              }
              break;

            case 'matches':
              if (stringValue !== formValues[rule.fieldToMatch]) {
                return {
                  isValid: false,
                  error: rule.message || `Must match ${rule.fieldToMatch}`,
                };
              }
              break;

            case 'custom':
              try {
                const customResult = rule.validate(value, formValues);
                if (!customResult) {
                  return {
                    isValid: false,
                    error: rule.message || 'Validation failed',
                  };
                }
              } catch (error) {
                console.error('Custom validation error:', error);
                return {
                  isValid: false,
                  error: rule.message || 'Validation error occurred',
                };
              }
              break;

            case 'async':
              try {
                const asyncResult = await rule.validate(
                  value,
                  formValues,
                  abortController.signal
                );
                if (!asyncResult) {
                  return {
                    isValid: false,
                    error: rule.message || 'Async validation failed',
                  };
                }
              } catch (error) {
                if (error.name === 'AbortError') {
                  return { isValid: false, error: '', aborted: true };
                }
                console.error('Async validation error:', error);
                return {
                  isValid: false,
                  error: rule.message || 'Validation error occurred',
                };
              }
              break;

            default:
              console.warn(`Unknown validation rule type: ${rule.type}`);
              break;
          }
        }

        return { isValid: true, error: '' };
      } finally {
        abortControllerRef.current = null;
      }
    },
    []
  );

  const runValidation = useCallback(
    async (currentValue, formValues = {}) => {
      if (!mountedRef.current) return { isValid: true, error: '' };

      setIsValidating(true);

      try {
        const result = await validateField(
          currentValue,
          memoizedValidations,
          formValues
        );

        if (mountedRef.current && !result.aborted) {
          setIsValid(result.isValid);
          setError(result.error);
        }

        return result;
      } finally {
        if (mountedRef.current) {
          setIsValidating(false);
        }
      }
    },
    [validateField, memoizedValidations]
  );

  const handleChange = useCallback(
    (newValue, formValues = {}) => {
      // Transform value if transformer is provided
      const transformedValue = transformValue
        ? transformValue(newValue)
        : newValue;
      setValue(transformedValue);

      // Clear validation timeout
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      // Only validate on change if configured to do so
      if (validateOn === 'change' || validateOn === 'both') {
        validationTimeoutRef.current = setTimeout(() => {
          runValidation(transformedValue, formValues);
        }, debounceMs);
      }
    },
    [runValidation, validateOn, debounceMs, transformValue]
  );

  const handleBlur = useCallback(
    (formValues = {}) => {
      setTouched(true);

      // Only validate on blur if configured to do so
      if (validateOn === 'blur' || validateOn === 'both') {
        runValidation(value, formValues);
      }
    },
    [runValidation, value, validateOn]
  );

  const validate = useCallback(
    (formValues = {}) => {
      return runValidation(value, formValues);
    },
    [runValidation, value]
  );

  const reset = useCallback(
    (newValue = initialValue) => {
      setValue(newValue);
      setError('');
      setTouched(false);
      setIsValidating(false);
      setIsValid(() => {
        const hasRequired = memoizedValidations.some(
          (rule) => rule.type === 'required'
        );
        return !(hasRequired && !newValue?.toString().trim());
      });

      // Clear any pending validations
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    },
    [initialValue, memoizedValidations]
  );

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount && memoizedValidations.length > 0) {
      runValidation(value);
    }
  }, [validateOnMount, runValidation, value, memoizedValidations]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    value,
    error,
    touched,
    isValid,
    isValidating,
    handleChange,
    handleBlur,
    validate,
    setValue,
    reset,
    // Computed properties
    showError: touched && error,
    hasValue: Boolean(value?.toString().trim()),
  };
};

// Example usage component
const ExampleForm = () => {
  const emailField = useFieldValidation('', [
    { type: 'required', message: 'Email is required' },
    { type: 'regex', pattern: 'email', message: 'Please enter a valid email' },
  ]);

  const passwordField = useFieldValidation('', [
    { type: 'required', message: 'Password is required' },
    {
      type: 'minLength',
      value: 8,
      message: 'Password must be at least 8 characters',
    },
    {
      type: 'regex',
      pattern: 'strongPassword',
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  ]);

  const confirmPasswordField = useFieldValidation('', [
    { type: 'required', message: 'Please confirm your password' },
    {
      type: 'matches',
      fieldToMatch: 'password',
      message: 'Passwords do not match',
    },
  ]);

  const handleSubmit = async () => {
    const formValues = {
      email: emailField.value,
      password: passwordField.value,
      confirmPassword: confirmPasswordField.value,
    };

    // Validate all fields
    const emailValid = await emailField.validate(formValues);
    const passwordValid = await passwordField.validate(formValues);
    const confirmPasswordValid = await confirmPasswordField.validate(
      formValues
    );

    if (
      emailValid.isValid &&
      passwordValid.isValid &&
      confirmPasswordValid.isValid
    ) {
      console.log('Form is valid!', formValues);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign Up Form</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={emailField.value}
            onChange={(e) =>
              emailField.handleChange(e.target.value, {
                email: e.target.value,
                password: passwordField.value,
                confirmPassword: confirmPasswordField.value,
              })
            }
            onBlur={() =>
              emailField.handleBlur({
                email: emailField.value,
                password: passwordField.value,
                confirmPassword: confirmPasswordField.value,
              })
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              emailField.showError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          {emailField.showError && (
            <p className="text-red-500 text-sm mt-1">{emailField.error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={passwordField.value}
            onChange={(e) =>
              passwordField.handleChange(e.target.value, {
                email: emailField.value,
                password: e.target.value,
                confirmPassword: confirmPasswordField.value,
              })
            }
            onBlur={() =>
              passwordField.handleBlur({
                email: emailField.value,
                password: passwordField.value,
                confirmPassword: confirmPasswordField.value,
              })
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              passwordField.showError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
          />
          {passwordField.showError && (
            <p className="text-red-500 text-sm mt-1">{passwordField.error}</p>
          )}
          {passwordField.isValidating && (
            <p className="text-blue-500 text-sm mt-1">Validating...</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPasswordField.value}
            onChange={(e) =>
              confirmPasswordField.handleChange(e.target.value, {
                email: emailField.value,
                password: passwordField.value,
                confirmPassword: e.target.value,
              })
            }
            onBlur={() =>
              confirmPasswordField.handleBlur({
                email: emailField.value,
                password: passwordField.value,
                confirmPassword: confirmPasswordField.value,
              })
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              confirmPasswordField.showError
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
          />
          {confirmPasswordField.showError && (
            <p className="text-red-500 text-sm mt-1">
              {confirmPasswordField.error}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            !emailField.isValid ||
            !passwordField.isValid ||
            !confirmPasswordField.isValid
          }
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export { useFieldValidation, ExampleForm };
export default useFieldValidation;
