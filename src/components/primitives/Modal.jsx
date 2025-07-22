import React from 'react';
import Button from './Button';

const Modal = ({
    title = 'Modal Title',
    message = 'Modal message',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    showCancel = true,
}) => {
  return (
    <div className="modal">
      <div className="modal-header">
        <h1 id="modal-title" className="modal-title">
          {title}
        </h1>
      </div>

      <div className="modal-body">
        <p>{message}</p>
      </div>

      <div className="modal-footer">
        {showCancel && (
          <Button onClick={onCancel} text={cancelText} variant="secondary" />
        )}

        <Button onClick={onConfirm} text={confirmText} variant="primary" />
      </div>
    </div>
  );
};

export default Modal;
