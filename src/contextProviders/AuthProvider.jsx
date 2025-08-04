import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../SupabaseConfiguration';
import useFetch from '../customHooks/useFetch';
import useSessionTimeout from '../customHooks/useSessionTimeout';
import { useModalActions } from './ModalProvider';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const { showAlert } = useModalActions();

  const api = useFetch({
    baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
    timeout: 10000,
    retries: 0,
    cache: true,
    defaultHeaders: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
    },
  });

  // Helper to build user object from session and customer data
  const buildUserObject = useCallback(
    (sessionUser, customer = null, addresses = []) => {
      if (!sessionUser) return null;
      return {
        user_id: sessionUser.id,
        customer_id: customer?.id || null,
        email: sessionUser.email || '',
        first_name:
          customer?.first_name || sessionUser.email?.split('@')[0] || 'User',
        last_name:
          customer?.last_name || sessionUser.email?.split('@')[0] || 'User',
        cpf_cnpj: customer?.cpf_cnpj || '',
        phone: customer?.phone || '',
        avatar: sessionUser.user_metadata?.avatar_url || null,
        updated_at: customer?.updated_at || new Date().toISOString(),
        addresses: Array.isArray(addresses) ? [...addresses] : [],
      };
    },
    []
  );

  // Fetch user data from database
  const fetchUserData = useCallback(
    async (sessionUser) => {
      if (!sessionUser?.id) {
        console.log('[AuthProvider] No session user provided');
        return null;
      }

      try {
        console.log('[AuthProvider] Fetching user data for:', sessionUser.id);

        // Fetch customer data with timeout
        const customerPromise = supabase
          .from('customers')
          .select('*')
          .eq('user_id', sessionUser.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Customer query timeout')), 8000)
        );

        const customerResult = await Promise.race([
          customerPromise,
          timeoutPromise,
        ]);

        console.log('[AuthProvider] Customer query result:', customerResult);

        if (customerResult.error && customerResult.error.code !== 'PGRST116') {
          console.error(
            '[AuthProvider] Customer fetch error:',
            customerResult.error
          );
          throw customerResult.error;
        }

        // If no customer found, return basic user object
        if (!customerResult.data || customerResult.error?.code === 'PGRST116') {
          console.log('[AuthProvider] No customer found, returning basic user');
          return buildUserObject(sessionUser);
        }

        // Fetch addresses with timeout
        let addresses = [];
        try {
          const addressPromise = supabase
            .from('customer_addresses')
            .select('*')
            .eq('customer_id', customerResult.data.id);

          const addressTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Address query timeout')), 5000)
          );

          const addressResult = await Promise.race([
            addressPromise,
            addressTimeoutPromise,
          ]);

          if (addressResult.error) {
            console.warn(
              '[AuthProvider] Address fetch error (non-fatal):',
              addressResult.error
            );
          } else {
            addresses = addressResult.data || [];
          }
        } catch (addressErr) {
          console.warn(
            '[AuthProvider] Address fetch failed (non-fatal):',
            addressErr
          );
        }

        const userData = buildUserObject(
          sessionUser,
          customerResult.data,
          addresses
        );
        console.log('[AuthProvider] Built user object:', userData);
        return userData;
      } catch (err) {
        console.error('[AuthProvider] fetchUserData error:', err);
        // Instead of throwing, return basic user object as fallback
        console.log(
          '[AuthProvider] Returning basic user as fallback due to error'
        );
        return buildUserObject(sessionUser);
      }
    },
    [buildUserObject]
  );

  // Handle auth state changes
  const handleAuthStateChange = useCallback(
    async (event, newSession) => {
      console.log(
        '[AuthProvider] Auth state change:',
        event,
        newSession?.user?.id
      );

      try {
        setSession(newSession);

        if (event === 'SIGNED_OUT' || !newSession?.user) {
          console.log('[AuthProvider] Signed out or no user, clearing state');
          setUser(null);
          setIsLoggedIn(false);
          setError(null);
          setLoading(false);
          return;
        }

        // Only process INITIAL_SESSION and ignore SIGNED_IN to avoid duplicates
        if (event === 'INITIAL_SESSION') {
          console.log('[AuthProvider] Fetching user data for event:', event);
          setLoading(true);
          const userData = await fetchUserData(newSession.user);
          console.log('[AuthProvider] Fetched user data:', userData);
          setUser(userData);
          setIsLoggedIn(!!userData);
        }

        // For TOKEN_REFRESHED, just update the session but keep existing user data
        // unless the user ID changed (unlikely but possible)
        if (event === 'TOKEN_REFRESHED') {
          console.log(
            '[AuthProvider] Token refreshed, checking if user changed'
          );
          const currentUserId = user?.user_id;
          if (currentUserId !== newSession.user.id) {
            console.log(
              '[AuthProvider] User ID changed, fetching new user data'
            );
            const userData = await fetchUserData(newSession.user);
            setUser(userData);
            setIsLoggedIn(!!userData);
          } else {
            console.log('[AuthProvider] Same user, keeping existing data');
          }
        }

        // Ignore SIGNED_IN as it's redundant with INITIAL_SESSION
        if (event === 'SIGNED_IN') {
          console.log(
            '[AuthProvider] SIGNED_IN ignored - INITIAL_SESSION handles this'
          );
          return;
        }
      } catch (err) {
        console.error('[AuthProvider] Auth state change error:', err);
        setError(err.message || 'Authentication error occurred');
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        if (event !== 'SIGNED_IN') {
          // Don't set loading false for ignored events
          console.log('[AuthProvider] Setting loading to false');
          setLoading(false);
        }
      }
    },
    [fetchUserData]
  ); // Remove user dependency to prevent recreation

  // Set up auth state listener
  useEffect(() => {
    console.log('[AuthProvider] Setting up auth listener');

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      console.log('[AuthProvider] Cleaning up auth listener');
      subscription?.unsubscribe();
    };
  }, []); // Remove dependency to prevent recreation

  // Session timeout handler
  const handleSessionExpired = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    setSession(null);
    setError(null);
  }, []);

  // Use the session timeout hook
  useSessionTimeout(session, handleSessionExpired);

  // Refresh user data from database
  const refreshUser = useCallback(async () => {
    if (!session?.user) {
      console.warn('[AuthProvider] No session available for refresh');
      return;
    }

    try {
      console.log('[AuthProvider] Refreshing user data');
      const userData = await fetchUserData(session.user);
      setUser(userData);
      setIsLoggedIn(!!userData);
    } catch (error) {
      console.error('[AuthProvider] Refresh user error:', error);
      setError(error.message || 'Failed to refresh user data');
    }
  }, [session?.user, fetchUserData]);

  // Auth functions
  const login = async (email, password) => {
    console.log('[AuthProvider] Login attempt for:', email);
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during login';
      setError(errorMessage);
      console.error('[AuthProvider] Login error:', err);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, name = '') => {
    console.log('[AuthProvider] Register attempt for:', email);
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during registration';
      setError(errorMessage);
      console.error('[AuthProvider] Register error:', err);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    console.log('[AuthProvider] Logout initiated');
    try {
      await supabase.auth.signOut();
      // State will be cleared by the auth state change listener
    } catch (error) {
      console.error('[AuthProvider] Logout error:', error);
      // Force clear state even if logout fails
      setUser(null);
      setIsLoggedIn(false);
      setSession(null);
    }
  };

  const loginWithProvider = async (provider) => {
    console.log('[AuthProvider] Provider login for:', provider);
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = `An unexpected error occurred during ${provider} login`;
      setError(errorMessage);
      console.error('[AuthProvider] Provider login error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    console.log('[AuthProvider] Password reset for:', email);
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during password reset';
      setError(errorMessage);
      console.error('[AuthProvider] Password reset error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    console.log('[AuthProvider] Profile update:', updates);
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.updateUser({ data: updates });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser((prev) => ({
        ...prev,
        ...updates,
        name: updates.name || prev?.name,
      }));

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during profile update';
      setError(errorMessage);
      console.error('[AuthProvider] Profile update error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUserProfile = async (userId) => {
    console.log('[AuthProvider] Fetching user profile for:', userId);
    try {
      const result = await api.get(`/profiles?id=eq.${userId}`);
      return result;
    } catch (error) {
      console.error('[AuthProvider] Fetch user profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    setUser,
    refreshUser,
    isLoggedIn,
    loading,
    error,
    login,
    register,
    logout,
    loginWithProvider,
    resetPassword,
    updateProfile,
    clearError,
    api,
    fetchUserProfile,
    session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
