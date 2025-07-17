import React, { useState } from 'react';

const Select = ({ data, initialValue, selectInput, id, ...props }) => {
  const [value, setValue] = useState(initialValue);

  function handleChange({ target }) {
    setValue(target.value);
    selectInput ? selectInput({ value: target.value, id }) : null;
    return;
  }
  return (
    <select value={value} className="beautiful-select" onChange={handleChange}>
      <option disabled value={initialValue}>
        {initialValue}
      </option>
      {data.map((item) => {
        return (
          <option id={id} props={props} key={item} value={item}>
            {item}
          </option>
        );
      })}
    </select>
  );
};

export default Select;
