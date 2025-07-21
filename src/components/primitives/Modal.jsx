import React from 'react';
import Overlay from './Overlay';

const Modal = () => {
  function handleClick(item) {
    console.log(item);
  }

  return (
    <>
      <Overlay onButtonClick={handleClick}>
        <div className="modal">
          <div className="modal-header">
            <h1 className="modal-title">Vini</h1>
          </div>

          <div className="modal-body">
            <p>Deu erro hein!</p>
          </div>

          <div className="modal-footer">
            <button className="btn">Tabom né</button>
          </div>
        </div>
      </Overlay>
    </>
  );
};

export default Modal;
