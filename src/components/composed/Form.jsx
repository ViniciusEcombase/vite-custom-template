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
        showDialog({
          title: 'Success',
          message: 'Form submitted successfully!',
        });

        if (onSubmit) {
          await onSubmit(values);
        } else {
          alert('Form submitted successfully!');
        }
      } else {
        console.log('Validation errors:', validationResults);
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
