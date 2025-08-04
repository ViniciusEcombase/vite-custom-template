import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import Modal from '../components/Modal/Modal';

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

// Countdown Bar Component
const CountdownBar = ({ duration, onComplete, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    setTimeLeft(duration);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [duration, onComplete, isActive]);

  // Calculate percentage for progress bar
  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="countdown-container">
      <div className="countdown-bar">
        <div className="countdown-progress" style={{ width: `${progress}%` }} />
      </div>
      <div className="countdown-text">
        Redirecting in {timeLeft} second{timeLeft !== 1 ? 's' : ''}...
      </div>
    </div>
  );
};

// Modal Container Component
const ModalContainer = ({ children, onClose, isVisible }) => {
  const modalRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // Handle animation completion to enable scrolling
  useEffect(() => {
    if (isVisible && modalRef.current) {
      // Remove the class first (in case of re-opening)
      modalRef.current.classList.remove('animation-complete');

      // Add the class after animation completes (300ms)
      const timer = setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.classList.add('animation-complete');
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

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
      // Get the current scroll bar width
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Apply styles to prevent layout shift
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;

      // Also apply to fixed elements if needed
      const fixedElements = document.querySelectorAll(
        '[data-fixed-compensate]'
      );
      fixedElements.forEach((el) => {
        el.style.paddingRight = `${scrollBarWidth}px`;
      });
    } else {
      // Reset styles
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Reset fixed elements
      const fixedElements = document.querySelectorAll(
        '[data-fixed-compensate]'
      );
      fixedElements.forEach((el) => {
        el.style.paddingRight = '';
      });
    }

    return () => {
      // Cleanup
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      const fixedElements = document.querySelectorAll(
        '[data-fixed-compensate]'
      );
      fixedElements.forEach((el) => {
        el.style.paddingRight = '';
      });
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
      // New countdown options
      showCountdown = false,
      countdownDuration = 5,
      onCountdownComplete,
    }) => {
      const handleClose = () => {
        onClose?.();
        closeModal();
      };

      const handleCountdownComplete = () => {
        onCountdownComplete?.();
        closeModal();
      };

      openModal(
        <div>
          <Modal
            title={title}
            message={message}
            confirmText={confirmText}
            onConfirm={handleClose}
            showCancel={false}
          />
          {showCountdown && (
            <CountdownBar
              duration={countdownDuration}
              onComplete={handleCountdownComplete}
              isActive={true}
            />
          )}
        </div>
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
