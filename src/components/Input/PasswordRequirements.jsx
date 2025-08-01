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
  className = '',
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

  // Enhanced visibility management
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Double RAF for smooth animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else if (shouldRender) {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      const timeout = setTimeout(() => setShouldRender(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, shouldRender]);

  // Don't render if not needed
  if (!shouldRender) {
    return null;
  }

  // Enhanced strength level configuration
  const getStrengthConfig = (level) => {
    const configs = {
      'very-weak': {
        color: '#ff4444',
        bgColor: 'rgba(255, 68, 68, 0.1)',
        label: 'Very Weak',
        icon: '⚠️',
      },
      weak: {
        color: '#ff8800',
        bgColor: 'rgba(255, 136, 0, 0.1)',
        label: 'Weak',
        icon: '⚡',
      },
      fair: {
        color: '#ffaa00',
        bgColor: 'rgba(255, 170, 0, 0.1)',
        label: 'Fair',
        icon: '⚡',
      },
      good: {
        color: '#88bb00',
        bgColor: 'rgba(136, 187, 0, 0.1)',
        label: 'Good',
        icon: '✨',
      },
      strong: {
        color: '#44aa44',
        bgColor: 'rgba(68, 170, 68, 0.1)',
        label: 'Strong',
        icon: '🔒',
      },
      'very-strong': {
        color: '#00aa44',
        bgColor: 'rgba(0, 170, 68, 0.1)',
        label: 'Very Strong',
        icon: '🛡️',
      },
    };
    return configs[level.id] || configs['very-weak'];
  };

  const strengthConfig = getStrengthConfig(strengthLevel);

  return (
    <div
      id={id}
      className={`password-requirements ${
        isAnimating ? 'show' : ''
      } ${className}`.trim()}
      role="region"
      aria-label="Password requirements and strength indicator"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Enhanced header with strength indicator */}
      <div className="requirements-header">
        <span className="requirements-title">Password Requirements</span>
        {showStrengthIndicator && password.length > 0 && (
          <div className="strength-indicator">
            <span
              className={`strength-label strength-${strengthLevel.id}`}
              aria-label={strengthAriaLabel}
            >
              <span className="strength-icon">{strengthConfig.icon}</span>
              <span className="strength-text">{strengthConfig.label}</span>
            </span>
          </div>
        )}
      </div>

      {/* Enhanced progress bar */}
      {showProgressBar && password.length > 0 && (
        <div className="progress-container">
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={passedPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Password strength: ${passedPercentage}%`}
          >
            <div
              className={`progress-fill progress-${strengthLevel.id}`}
              style={{ width: `${passedPercentage}%` }}
            />
          </div>
          <div className="progress-stats">
            <span className="progress-text">
              {validCount} of {totalRequirements} requirements met
            </span>
            <span
              className={`progress-percentage strength-${strengthLevel.id}`}
            >
              {Math.round(passedPercentage)}%
            </span>
          </div>
        </div>
      )}

      {/* Enhanced requirements list */}
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

      {/* Enhanced accessibility descriptions */}
      <div className="visually-hidden" aria-live="polite">
        {ariaDescription}
      </div>

      <div className="visually-hidden" aria-live="polite">
        Password strength: {strengthConfig.label}.{validCount} out of{' '}
        {totalRequirements} requirements met.
        {isValid
          ? ' Password meets all requirements.'
          : ' Password needs improvement.'}
      </div>
    </div>
  );
};

export default PasswordRequirements;
