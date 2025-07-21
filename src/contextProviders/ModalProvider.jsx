import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [content, setContent] = useState(null);

  const openModal = useCallback((modalContent) => {
    setContent(() => modalContent);
  }, []);

  const closeModal = useCallback(() => {
    setContent(null);
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {content && (
        <div className="overlay" onClick={closeModal}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
