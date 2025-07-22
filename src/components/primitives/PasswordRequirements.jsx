import React from 'react';

const PasswordRequirements = ({ password, isVisible }) => {
  const requirements = [
    { text: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { text: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { text: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { text: 'One number', test: (pwd) => /\d/.test(pwd) },
    { text: 'One special character', test: (pwd) => /[@$!%?&]/.test(pwd) },
  ];

  return (
    <div className={`password-requirements ${isVisible ? 'show' : ''}`}>
      <div className="requirements-header">
        <span>Password requirements:</span>
      </div>
      <div className="requirements-list">
        {requirements.map((req, index) => {
          const isValid = req.test(password || '');
          return (
            <div
              key={index}
              className={`requirement-item ${isValid ? 'valid' : 'invalid'}`}
            >
              <div className="requirement-icon">{isValid ? '✓' : '○'}</div>
              <span className="requirement-text">{req.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordRequirements;
