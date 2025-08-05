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
    (sessionUser, customer = null, addresses = [], cart_id = null) => {
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
        cart_id: cart_id?.id || '',
      };
    },
    []
  );

  // Fetch user data from database
  const fetchUserData = useCallback(
    async (sessionUser) => {
      if (!sessionUser?.id) {
        return null;
      }

      try {
        const {
          data: [customerData],
        } = await api.get(`/customers?user_id=eq.${sessionUser.id}`);
        const {
          data: [cartData],
        } = await api.get(`/carts?customer_id=eq.${customerData.id}`);
        let addresses = [];
        try {
          const { data: customerAddressData } = await api.get(
            `/customer_addresses?customer_id=eq.${customerData.id}`
          );

          addresses = customerAddressData || [];
        } catch (addressErr) {
          showAlert({ title: 'Error', message: addressErr });
        }

        const userData = buildUserObject(
          sessionUser,
          customerData,
          addresses,
          cartData
        );
        return userData;
      } catch (err) {
        return buildUserObject(sessionUser);
      }
    },
    [buildUserObject]
  );

  // Handle auth state changes
  const handleAuthStateChange = useCallback(
    async (event, newSession) => {
      try {
        setSession(newSession);

        if (event === 'SIGNED_OUT' || !newSession?.user) {
          setUser(null);
          setIsLoggedIn(false);
          setError(null);
          setLoading(false);
          return;
        }

        // Only process INITIAL_SESSION and ignore SIGNED_IN to avoid duplicates
        if (event === 'INITIAL_SESSION') {
          setLoading(true);
          const userData = await fetchUserData(newSession.user);
          setUser(userData);
          setIsLoggedIn(!!userData);
        }

        // For TOKEN_REFRESHED, just update the session but keep existing user data
        // unless the user ID changed (unlikely but possible)
        if (event === 'TOKEN_REFRESHED') {
          const currentUserId = user?.user_id;
          if (currentUserId !== newSession.user.id) {
            const userData = await fetchUserData(newSession.user);
            setUser(userData);
            setIsLoggedIn(!!userData);
          } else {
          }
        }

        // Ignore SIGNED_IN as it's redundant with INITIAL_SESSION
        if (event === 'SIGNED_IN') {
          return;
        }
      } catch (err) {
        setError(err.message || 'Authentication error occurred');
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        if (event !== 'SIGNED_IN') {
          // Don't set loading false for ignored events
          setLoading(false);
        }
      }
    },
    [fetchUserData]
  ); // Remove user dependency to prevent recreation

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
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
      return;
    }

    try {
      const userData = await fetchUserData(session.user);
      setUser(userData);
      setIsLoggedIn(!!userData);
    } catch (error) {
      setError(error.message || 'Failed to refresh user data');
    }
  }, [session?.user, fetchUserData]);

  // Auth functions
  const login = async (email, password) => {
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
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, name = '') => {
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
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // State will be cleared by the auth state change listener
    } catch (error) {
      // Force clear state even if logout fails
      setUser(null);
      setIsLoggedIn(false);
      setSession(null);
    }
  };

  const loginWithProvider = async (provider) => {
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
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
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
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
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
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const result = await api.get(`/profiles?id=eq.${userId}`);
      return result;
    } catch (error) {
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
