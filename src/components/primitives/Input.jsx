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
      getFormValues = () => ({}), // ✅ default empty
      onChangeNotify, // ✅ added if you're using it
      onValidChange,
    },
    ref
  ) => {
    const [showRequirements, setShowRequirements] = useState(false);
    const field = useFieldValidation(initialValue, validations);

    // Expose methods to parent
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
      const newValue = event.target.value;
      field.handleChange(newValue, getFormValues()); // ✅ correct usage
      if (onChangeNotify) onChangeNotify();
    };

    const handleFocus = () => {
      if (showPasswordRequirements) {
        setShowRequirements(true);
      }
    };

    const handleBlur = () => {
      field.handleBlur(getFormValues()); // ✅ pass full form context
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

    useEffect(() => {
      if (field.isValid) {
        onValidChange?.(field.value);
        console.log(field.value);
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
