import React, { useRef, useCallback, useState } from 'react';
import Input from '../primitives/Input';
import Button from '../primitives/Button';
import { useModalActions } from '../../contextProviders/ModalProvider';

const Form = ({ formData, onSubmit, label }) => {
  const { showConfirmDialog, showAlert, openModal, closeModal } =
    useModalActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef({});

  // Create refs for each input
  const getInputRef = useCallback((fieldId) => {
    if (!inputRefs.current[fieldId]) {
      inputRefs.current[fieldId] = React.createRef();
    }
    return inputRefs.current[fieldId];
  }, []);

  // ✅ ADD THIS FUNCTION - This lets each input know about other field values
  const getFormValues = useCallback(() => {
    const formValues = {};
    Object.keys(inputRefs.current).forEach((fieldId) => {
      const inputRef = inputRefs.current[fieldId]?.current;
      if (inputRef) {
        formValues[fieldId] = inputRef.getValue();
      }
    });
    return formValues;
  }, []);

  // ✅ ADD THIS FUNCTION - Re-validate related fields when one changes
  const handleFieldChange = useCallback(
    (changedFieldId) => {
      // If password changed, re-validate confirm password
      if (changedFieldId === 'password') {
        const confirmRef = inputRefs.current['confirmPassword']?.current;
        if (confirmRef && confirmRef.getValue()) {
          // Small delay to ensure the password field has updated
          setTimeout(() => {
            confirmRef.validate(getFormValues());
          }, 50);
        }
      }

      // If confirm password changed, re-validate password (if it has matching rules)
      if (changedFieldId === 'confirmPassword') {
        const passwordRef = inputRefs.current['password']?.current;
        if (passwordRef && passwordRef.getValue()) {
          setTimeout(() => {
            passwordRef.validate(getFormValues());
          }, 50);
        }
      }
    },
    [getFormValues]
  );

  const validateAllFields = async () => {
    const formValues = {};
    const validationResults = {};

    // Get all current values first
    Object.keys(inputRefs.current).forEach((fieldId) => {
      const inputRef = inputRefs.current[fieldId]?.current;
      if (inputRef) {
        formValues[fieldId] = inputRef.getValue();
      }
    });

    // Validate all fields with form context
    for (const fieldId of Object.keys(inputRefs.current)) {
      const inputRef = inputRefs.current[fieldId]?.current;
      if (inputRef) {
        const result = await inputRef.validate(formValues);
        validationResults[fieldId] = result;
      }
    }

    return {
      isValid: Object.values(validationResults).every(
        (result) => result.isValid
      ),
      values: formValues,
      validationResults,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { isValid, values, validationResults } = await validateAllFields();

      if (isValid) {
        if (onSubmit) {
          await onSubmit(values);
        } else {
          alert('Form submitted successfully!');
        }
      } else {
        console.log('Validation errors:', validationResults, values);
        showConfirmDialog({
          title: 'Validation Error',
          message: 'Fix validations errors first',
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showAlert({
        title: 'Request error Error',
        message: 'An error ocurred when submiting the form',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return Object.keys(inputRefs.current).every((fieldId) => {
      const inputRef = inputRefs.current[fieldId]?.current;
      return inputRef ? inputRef.getIsValid() : false;
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="formLabel">{label}</h1>
      <div className="form-group">
        {formData.map((fieldConfig) => (
          <Input
            key={fieldConfig.id}
            ref={getInputRef(fieldConfig.id)}
            id={fieldConfig.id}
            label={fieldConfig.label}
            type={fieldConfig.type}
            validations={fieldConfig.validations}
            placeholder={
              fieldConfig.placeholder ||
              `Enter your ${fieldConfig.label.toLowerCase()}`
            }
            showPasswordRequirements={
              fieldConfig.showPasswordRequirements || false
            }
            initialValue={fieldConfig.initialValue || ''}
            getFormValues={getFormValues} // ✅ ADD THIS LINE - Pass the function to each input
            onChangeNotify={() => handleFieldChange(fieldConfig.id)} // ✅ ADD THIS LINE - Notify when field changes
          />
        ))}
      </div>
      <Button
        disabled={isSubmitting}
        onClick={handleSubmit}
        text={isSubmitting ? 'Submitting...' : 'Send'}
      />
    </form>
  );
};

export default Form;
