import React, { useState, useEffect } from 'react';
import usePasswordRequirements from '../../customHooks/usePasswordRequirements';

const PasswordRequirements = ({
  id,
  password,
  isVisible,
  options = {},
  passwordStrength, // Can receive external password strength data
  showStrengthIndicator = true,
  showProgressBar = true,
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use the enhanced password requirements hook
  const hookOptions = {
    enableScoring: true,
    debounceMs: 100, // Small debounce for better UX
    ...options,
  };

  const passwordData = usePasswordRequirements(password, hookOptions);

  // Use external password strength data if provided, otherwise use hook data
  const strengthData = passwordStrength || passwordData;

  const {
    requirements,
    validCount,
    totalRequirements,
    passedPercentage,
    strengthLevel,
    isValid,
    ariaDescription,
    strengthAriaLabel,
  } = strengthData;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else if (shouldRender) {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 350);
    }
  }, [isVisible, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      id={id}
      className={`password-requirements ${isAnimating ? 'show' : ''}`}
      role="region"
      aria-label="Password requirements"
      aria-live="polite"
    >
      <div className="requirements-header">
        <span>Password requirements:</span>
        {showStrengthIndicator && password.length > 0 && (
          <div className="strength-indicator">
            <span
              className={`strength-label strength-${strengthLevel.id}`}
              style={{ color: strengthLevel.color }}
              aria-label={strengthAriaLabel}
            >
              {strengthLevel.label}
            </span>
          </div>
        )}
      </div>

      {showProgressBar && password.length > 0 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className={`progress-fill progress-${strengthLevel.id}`}
              style={{
                width: `${passedPercentage}%`,
                backgroundColor: strengthLevel.color,
              }}
            />
          </div>
          <span className="progress-text">
            {validCount} of {totalRequirements} requirements met
          </span>
        </div>
      )}

      <div className="requirements-list">
        {requirements.map((req, index) => {
          const isRequirementValid = req.passed;
          return (
            <div
              key={req.id || index}
              className={`requirement-item ${
                isRequirementValid ? 'valid' : 'invalid'
              }`}
              aria-label={req.ariaLabel || req.text}
            >
              <div className="requirement-icon">
                {isRequirementValid ? '✓' : '○'}
              </div>
              <span className="requirement-text">{req.text}</span>
            </div>
          );
        })}
      </div>

      {/* Hidden accessibility description */}
      <div className="sr-only" aria-live="polite">
        {ariaDescription}
      </div>
    </div>
  );
};

export default PasswordRequirements;
