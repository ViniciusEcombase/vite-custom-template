import { useEffect, useRef, useCallback } from 'react';

import { useModalActions } from '../contextProviders/ModalProvider';

/**
 * Custom hook to handle session expiration via Supabase JWT expiration.
 *
 * @param {Object} session - The Supabase session object.
 * @param {Function} onSessionExpired - Callback to clear auth and/or user state.
 */
const useSessionTimeout = (session, onSessionExpired) => {
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  const { showAlert } = useModalActions();
  const sessionExpiredRef = useRef(false);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const handleSessionExpired = useCallback(() => {
    // Prevent multiple executions
    if (sessionExpiredRef.current) return;
    sessionExpiredRef.current = true;

    console.log('[SessionTimeout] Session expired! Showing modal.');

    showAlert({
      title: 'Session Expired',
      message:
        'Your session has expired. You will be redirected to the homepage.',
      confirmText: 'OK',
      showCountdown: true,
      countdownDuration: 5,
      onCountdownComplete: () => {
        console.log('[SessionTimeout] Redirecting to home after countdown.');
        onSessionExpired?.();
        window.location.href = `/`;
        sessionExpiredRef.current = false; // Reset for next time
      },
      onConfirm: () => {
        console.log(
          '[SessionTimeout] User clicked OK, redirecting immediately.'
        );
        onSessionExpired?.();
        window.location.href = `/`;
        sessionExpiredRef.current = false; // Reset for next time
      },
    });
  }, [showAlert, onSessionExpired]);

  const showWarning = useCallback(() => {
    console.log('[SessionTimeout] Showing session warning.');

    showAlert({
      title: 'Session Expiring Soon',
      message: 'Your session will expire in 2 minutes. Please save any work.',
      confirmText: 'OK',
      type: 'warning',
    });
  }, [showAlert]);

  const scheduleSessionTimeout = useCallback(() => {
    clearTimeouts();
    sessionExpiredRef.current = false;

    if (!session?.expires_at) {
      console.log('[SessionTimeout] No session or expiration time available.');
      return;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = session.expires_at - currentTime;

    console.log(`[SessionTimeout] Session expires in ${expiresIn} seconds.`);

    // If already expired or expires very soon
    if (expiresIn <= 0) {
      handleSessionExpired();
      return;
    }

    // Schedule warning 2 minutes before expiration
    const warningTime = Math.max(0, expiresIn - 120); // 2 minutes before
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        showWarning();
      }, warningTime * 1000);
    }

    // Schedule actual expiration handling
    timeoutRef.current = setTimeout(() => {
      handleSessionExpired();
    }, expiresIn * 1000);
  }, [session?.expires_at, clearTimeouts, handleSessionExpired, showWarning]); // Only depend on expires_at

  useEffect(() => {
    scheduleSessionTimeout();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.expires_at) {
        // Page became visible, check if session is still valid
        const currentTime = Math.floor(Date.now() / 1000);
        const expiresIn = session.expires_at - currentTime;

        if (expiresIn <= 0) {
          console.log(
            '[SessionTimeout] Session expired while page was hidden.'
          );
          handleSessionExpired();
        } else {
          // Only reschedule if significantly different (>30 seconds difference)
          // to avoid constant rescheduling
          console.log('[SessionTimeout] Page visible, session still valid');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeouts();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.expires_at, scheduleSessionTimeout, handleSessionExpired]); // Only key dependencies

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
      sessionExpiredRef.current = false;
    };
  }, [clearTimeouts]);
};

export default useSessionTimeout;
