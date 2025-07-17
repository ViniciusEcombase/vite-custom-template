import React, { useState } from 'react';
import Input from './Components/Input';
import Select from './Components/Select';

const App = () => {
  const [form, setForm] = useState({
    name: '',
    gender: '',
  });

  function handleSelect({ id, value }) {
    setForm({ ...form, [id]: value });
  }

  function handleInput({ id, value }) {
    setForm({ ...form, [id]: value });
  }

  return (
    <div>
      <Input id="name" onInputChange={handleInput} />
      <Select
        id="gender"
        data={['Vini', 'Joao']}
        initialValue={'MAISDNJASIDJASIO'}
        selectInput={handleSelect}
      />
    </div>
  );
};

export default App;
