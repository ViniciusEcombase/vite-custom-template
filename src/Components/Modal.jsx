import React from 'react';

const Modal = ({ message, ok, modal, handleModal }) => {
  return (
    <>
      {modal && (
        <div>
          <div className="modal-overlay" id="modal" onClick={handleModal}>
            <div className="modal-box">
              <button className="modal-close" onClick={handleModal}>
                &times;
              </button>
              <h2
                style={{
                  borderBottom: ok ? '1px solid green' : '1px solid red',
                }}
              >
                {message}
              </h2>
              <button className="modal-action" onClick={handleModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
