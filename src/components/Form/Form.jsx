import React, { useRef, useCallback, useState } from 'react';
import Input from '../Input/Input';
import Button from '../Button/Button';
import { useModalActions } from '../../contextProviders/ModalProvider';

const Form = ({
  formData,
  onSubmit,
  label,
  columns = 1,
  showCancel = false,
  onCancel = () => {},
}) => {
  const { showConfirmDialog, showAlert } = useModalActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef({});

  const getInputRef = useCallback((fieldId) => {
    if (!inputRefs.current[fieldId]) {
      inputRefs.current[fieldId] = React.createRef();
    }
    return inputRefs.current[fieldId];
  }, []);

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

  const handleFieldChange = useCallback(
    (changedFieldId) => {
      if (changedFieldId === 'password') {
        const confirmRef = inputRefs.current['confirmPassword']?.current;
        if (confirmRef && confirmRef.getValue()) {
          setTimeout(() => {
            confirmRef.validate(getFormValues());
          }, 50);
        }
      }

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

    Object.keys(inputRefs.current).forEach((fieldId) => {
      const inputRef = inputRefs.current[fieldId]?.current;
      if (inputRef) {
        formValues[fieldId] = inputRef.getValue();
      }
    });

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
        showConfirmDialog({
          title: 'Validation Error',
          message: 'Fix validation errors first',
        });
      }
    } catch (error) {
      showAlert({
        title: 'Request Error',
        message: 'An error occurred when submitting the form',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="formLabel">{label}</h1>
      <div className={`form-group ${columns === 2 ? 'two-columns' : ''}`}>
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
            getFormValues={getFormValues}
            onChangeNotify={() => handleFieldChange(fieldConfig.id)}
            disabled={fieldConfig.disabled || false}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {showCancel && (
          <Button
            size="md"
            variant="secondary"
            text="Cancel"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{ marginLeft: 'auto' }}
          />
        )}
        <Button
          size="md"
          variant="primary"
          disabled={isSubmitting}
          onClick={handleSubmit}
          text={isSubmitting ? 'Submitting...' : 'Send'}
        />
      </div>
    </form>
  );
};

export default Form;
