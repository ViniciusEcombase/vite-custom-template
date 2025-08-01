import { useState, useEffect, useRef } from 'react';
import Button from '../Button/Button';

// Countdown Bar Component
const CountdownBar = ({
  duration,
  onComplete,
  isActive,
  urgency = 'normal', // 'normal', 'warning', 'danger'
}) => {
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

  // Determine urgency class based on time left or prop
  const getUrgencyClass = () => {
    if (urgency === 'danger') return 'danger';
    if (urgency === 'warning') return 'warning';

    // Auto-determine based on time left
    const percentLeft = (timeLeft / duration) * 100;
    if (percentLeft <= 25) return 'danger';
    if (percentLeft <= 50) return 'warning';
    return '';
  };

  return (
    <div className="countdown-container">
      <div className="countdown-bar">
        <div
          className={`countdown-progress ${getUrgencyClass()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="countdown-text">
        Redirecting in {timeLeft} second{timeLeft !== 1 ? 's' : ''}...
      </div>
    </div>
  );
};

const Modal = ({
  title = 'Modal Title',
  message = 'Modal message',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true,
  // New countdown props
  showCountdown = false,
  countdownDuration = 5,
  onCountdownComplete,
  countdownUrgency = 'normal', // 'normal', 'warning', 'danger'
  // Optional custom content
  children,
}) => {
  const handleCountdownComplete = () => {
    onCountdownComplete?.();
  };

  const modalClassName = 'modal' + showCountdown ? 'has-countdown' : '';

  return (
    <div className={modalClassName}>
      <div className="modal-header">
        <h1 id="modal-title" className="modal-title">
          {title}
        </h1>
      </div>

      <div className="modal-body">{children ? children : <p>{message}</p>}</div>

      <div className="modal-footer">
        {showCancel && (
          <Button onClick={onCancel} text={cancelText} variant="secondary" />
        )}

        <Button onClick={onConfirm} text={confirmText} variant="primary" />
      </div>

      {showCountdown && (
        <CountdownBar
          duration={countdownDuration}
          onComplete={handleCountdownComplete}
          isActive={true}
          urgency={countdownUrgency}
        />
      )}
    </div>
  );
};

export default Modal;
