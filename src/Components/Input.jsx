import React, { useState, useCallback, useEffect } from 'react';

const Input = ({
  id,
  type = 'text',
  onInputChange,
  label,
  placeholder = 'Placeholder',
  initialValue = '',
  ...props
}) => {
  const [data, setData] = useState(initialValue);

  useEffect(() => {
    setData(initialValue);
  }, [initialValue]);

  const handleChange = useCallback(
    (event) => {
      const value = event.target.value;
      setData(value);
      onInputChange({ id, value });
    },
    [id, onInputChange]
  );

  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        placeholder={placeholder}
        className="form-input"
        id={id}
        onChange={handleChange}
        value={data}
        type={type}
        {...props}
      />
    </div>
  );
};

export default Input;
