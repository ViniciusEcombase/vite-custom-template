import React, { useState } from 'react';

const Input = ({ id, type, onInputChange, label, keys }) => {
  const [data, setData] = useState('');

  function handleChange(event) {
    const eventData = event.target.value;
    setData(eventData);
    onInputChange({ id, eventData });
  }

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        key={keys}
        id={id}
        className="beautiful-input"
        onInput={handleChange}
        value={data}
        type={type}
      />
    </div>
  );
};

export default Input;
