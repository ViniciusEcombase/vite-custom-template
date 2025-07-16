import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import useFetch from './useFetch';
import Modal from './Modal';

const objetos = [
  {
    id: 'nome',
    label: 'Nome',
    type: 'text',
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
  },
  {
    id: 'senha',
    label: 'Senha',
    type: 'password',
  },
  {
    id: 'cep',
    label: 'Cep',
    type: 'text',
  },
  {
    id: 'rua',
    label: 'Rua',
    type: 'text',
  },
  {
    id: 'numero',
    label: 'Numero',
    type: 'text',
  },
  {
    id: 'bairro',
    label: 'Bairro',
    type: 'text',
  },
  {
    id: 'cidade',
    label: 'Cidade',
    type: 'text',
  },
  {
    id: 'estado',
    label: 'Estado',
    type: 'text',
  },
];
const Form = () => {
  const [modal, setModal] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { data, loader, status, fetchRequest } = useFetch();
  const [form, setForm] = useState(
    objetos.reduce((acc, item) => {
      acc[item.id] = '';
      return acc;
    }, {})
  );

  function handleChange({ id, eventData }) {
    setForm({ ...form, [id]: eventData });
  }

  async function handleSubmit(event) {
    setButtonDisabled(true);
    event.preventDefault();
    await fetchRequest('https://ranekapi.origamid.dev/json/api/usuario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });
    setModal(true);
    setButtonDisabled(false);
    console.log(data);
    console.log(form);

    return;
  }

  function handleModal({ target, currentTarget }) {
    if (target === currentTarget) {
      setModal(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {objetos.map(({id, type, label}) => {
        return (
          <Input
            key={id}
            id={id}
            type={type}
            label={label}
            onInputChange={handleChange}
          />
        );
      })}
      {loader && (
        <div id="loader" className="loader-overlay">
          {' '}
          <div className="loader"></div>
        </div>
      )}

      <Button disabled={buttonDisabled} text="Enviar" />
      <Modal
        message={status.message}
        ok={status.ok}
        modal={modal}
        handleModal={handleModal}
        text={status.dataValue}
      />
    </form>
  );
};

export default Form;
