import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
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
      passwordRequirementsOptions = {}, // New prop for password requirements configuration
      getFormValues = () => ({}),
      onChangeNotify,
      onValidChange,
      onPasswordStrengthChange, // New callback for password strength updates
    },
    ref
  ) => {
    const [showRequirements, setShowRequirements] = useState(false);
    const field = useFieldValidation(initialValue, validations);

    // Expose methods to parent (enhanced with password-specific methods)
    useImperativeHandle(
      ref,
      () => ({
        validate: field.validate,
        getValue: () => field.value,
        getIsValid: () => field.isValid,
        setValue: field.setValue,
        // Password-specific methods
        getPasswordStrength: showPasswordRequirements
          ? () => field.passwordStrength || null
          : undefined,
        isPasswordStrong: showPasswordRequirements
          ? () => field.passwordStrength?.isStrong || false
          : undefined,
      }),
      [
        field.validate,
        field.value,
        field.isValid,
        field.setValue,
        field.passwordStrength,
        showPasswordRequirements,
      ]
    );

    const handleChange = (event) => {
      const newValue = event.target.value;
      field.handleChange(newValue, getFormValues());
      if (onChangeNotify) onChangeNotify();
    };

    const handleFocus = () => {
      if (showPasswordRequirements) {
        setShowRequirements(true);
      }
    };

    const handleBlur = () => {
      field.handleBlur(getFormValues());
      if (showPasswordRequirements) {
        // Hide requirements only if password is valid or empty
        setShowRequirements(!field.isValid || field.value.length === 0);
      }
    };

    const getInputClass = () => {
      let classes = 'form-input';
      if (field.touched) {
        classes += field.isValid ? ' success' : ' error';
      }
      if (showPasswordRequirements && field.value.length > 0) {
        // Use password strength for more nuanced styling
        if (field.passwordStrength) {
          const { strengthLevel, isValid } = field.passwordStrength;
          classes += ` password-strength-${strengthLevel.id}`;
          if (isValid) classes += ' valid-password';
          else classes += ' invalid-password';
        }
      }
      return classes;
    };

    // Handle password strength changes
    useEffect(() => {
      if (
        showPasswordRequirements &&
        field.passwordStrength &&
        onPasswordStrengthChange
      ) {
        onPasswordStrengthChange(field.passwordStrength);
      }
    }, [
      field.passwordStrength,
      onPasswordStrengthChange,
      showPasswordRequirements,
    ]);

    useEffect(() => {
      if (field.isValid) {
        onValidChange?.(field.value);
      }
    }, [field.value, field.isValid, onValidChange]);

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
          aria-describedby={
            showPasswordRequirements ? `${id}-requirements` : undefined
          }
        />
        {field.touched && field.error && (
          <span className="form-error" role="alert">
            {field.error}
          </span>
        )}
        {showPasswordRequirements && (
          <PasswordRequirements
            id={`${id}-requirements`}
            password={field.value}
            isVisible={showRequirements}
            options={passwordRequirementsOptions}
            passwordStrength={field.passwordStrength}
          />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
