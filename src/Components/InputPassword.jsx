import React, { useState, useCallback, useEffect } from 'react';
import PasswordRequirements from './PasswordRequirements';

const InputPassword = ({
  id,
  label,
  onInputChange,
  placeholder = 'Enter your password',
}) => {
  const [password, setPassword] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // 🔧 FIXED: Corrected the regex pattern - removed the incorrect escaping
  const validatePassword = useCallback((item) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
    return strongPasswordRegex.test(item);
  }, []);

  useEffect(() => {
    const valid = validatePassword(password);
    setIsValid(valid);
    onInputChange({ id, value: password, isValid: valid });
  }, [password, validatePassword, onInputChange, id]);

  const handleChange = (event) => {
    setPassword(event.target.value);
  };

  const handleFocus = () => {
    setShowRequirements(true);
  };

  const handleBlur = () => {
    // Keep requirements visible if password is not valid
    if (isValid) {
      setShowRequirements(false);
    }
  };

  const getInputClass = () => {
    let classes = 'form-input';
    if (password.length > 0) {
      classes += isValid ? ' valid-password' : ' invalid-password';
    }
    return classes;
  };

  return (
    <div className="form-input-password">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="password"
        value={password}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={getInputClass()}
      />
      <PasswordRequirements password={password} isVisible={showRequirements} />
    </div>
  );
};

export default InputPassword;
