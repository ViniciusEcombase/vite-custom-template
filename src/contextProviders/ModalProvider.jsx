import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import Modal from '../components/primitives/Modal';

const ModalContext = createContext();

// Error Boundary for Modal Content
class ModalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Modal content error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="modal-error">
          <h2>Something went wrong</h2>
          <p>The modal content encountered an error.</p>
          <button onClick={this.props.onClose} className="btn">
            Close
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Modal Container Component
const ModalContainer = ({ children, onClose, isVisible }) => {
  const modalRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // Focus management
  useEffect(() => {
    if (isVisible) {
      // Store currently focused element
      previouslyFocusedElement.current = document.activeElement;

      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);
    }

    return () => {
      // Restore focus when modal closes
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isVisible]);

  // Keyboard event handling
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e) => {
      // Close modal on ESC
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="modal-container"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalErrorBoundary onClose={onClose}>{children}</ModalErrorBoundary>
      </div>
    </div>
  );
};

// Enhanced Modal Provider
export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    content: null,
    isVisible: false,
  });

  const openModal = useCallback((modalContent) => {
    setModalState({
      content: modalContent,
      isVisible: true,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      content: null,
      isVisible: false,
    });
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <ModalContainer isVisible={modalState.isVisible} onClose={closeModal}>
        {modalState.content}
      </ModalContainer>
    </ModalContext.Provider>
  );
};

// Hook for modal actions
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Hook for common modal patterns
export const useModalActions = () => {
  const { openModal, closeModal } = useModal();

  const showConfirmDialog = useCallback(
    ({
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm,
      onCancel,
    }) => {
      const handleConfirm = () => {
        onConfirm?.();
        closeModal();
      };

      const handleCancel = () => {
        onCancel?.();
        closeModal();
      };

      openModal(
        <Modal
          title={title}
          message={message}
          confirmText={confirmText}
          cancelText={cancelText}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );
    },
    [openModal, closeModal]
  );

  const showAlert = useCallback(
    ({
      title = 'Information',
      message = 'This is an alert dialog with important information.',
      confirmText = 'OK',
      onClose,
    }) => {
      const handleClose = () => {
        onClose?.();
        closeModal();
      };

      openModal(
        <Modal
          title={title}
          message={message}
          confirmText={confirmText}
          onConfirm={handleClose}
          showCancel={false}
        />
      );
    },
    [openModal, closeModal]
  );

  return {
    openModal,
    closeModal,
    showConfirmDialog,
    showAlert,
  };
};
