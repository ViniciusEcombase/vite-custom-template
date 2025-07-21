import React, { useState, useCallback, useEffect, useMemo } from 'react';
import usePasswordRequirements from '../CustomHooks/usePasswordRequirements';

// Custom Icons
const CheckIcon = () => (
  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const XIcon = () => (
  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const PasswordRequirements = ({ password, isVisible }) => {
  const { requirements, strengthClass } = usePasswordRequirements(password);

  return (
    <>
      {/* Password Strength Indicator */}
      <div className={`password-strength ${isVisible ? 'show' : 'hide'}`}>
        <div className={`strength-bar ${strengthClass}`}></div>
      </div>

      {/* Password Requirements */}
      <div className={`password-requirements ${isVisible ? 'show' : ''}`}>
        <div className="requirements-header">
          <span>Password must contain:</span>
        </div>
        <div className="requirements-list">
          {requirements.map((req) => {
            const isValid = req.test(password);
            return (
              <div
                key={req.id}
                className={`requirement-item ${isValid ? 'valid' : 'invalid'}`}
              >
                <div className="requirement-icon">{isValid ? '✓' : '○'}</div>
                <span className="requirement-text">{req.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
export default PasswordRequirements;
