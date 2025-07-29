import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../SupabaseConfiguration';
import useFetch from '../customHooks/useFetch';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure useFetch for Supabase REST API calls (if needed)
  const api = useFetch({
    baseURL: 'https://niihlyofonxtmzgzanpv.supabase.co/rest/v1',
    timeout: 10000,
    retries: 0,
    cache: true,
    defaultHeaders: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
    },
  });

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        let customer;
        if (session) {
          customer = await api.get(
            `/customers?select=*&user_id=eq.${session.user.id}`
          );
        }
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
        } else if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            first_name:
              customer.data[0].first_name ||
              session.user.email?.split('@')[0] ||
              'User',
            last_name:
              customer.data[0].last_name ||
              session.user.email?.split('@')[0] ||
              'User',
            cpf_cnpj: customer.data[0].cpf_cnpj,
            phone: customer.data[0].phone,
            avatar: session.user.user_metadata?.avatar_url || null,
          });
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        let customer;
        if (session) {
          customer = await api.get(
            `/customers?select=*&user_id=eq.${session.user.id}`
          );
        }
        setUser({
          id: session.user.id,
          email: session.user.email,
          first_name:
            customer.data[0].first_name ||
            session.user.email?.split('@')[0] ||
            'User',
          last_name:
            customer.data[0].last_name ||
            session.user.email?.split('@')[0] ||
            'User',
          cpf_cnpj: customer.data[0].cpf_cnpj,
          phone: customer.data[0].phone,
          avatar: session.user.user_metadata?.avatar_url || null,
        });

        setIsLoggedIn(true);
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
        setError(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const customer = await api.get(
      `/customers?select=*&user_id=eq.${session.user.id}`
    );
    console.log(customer);

    if (customer.data?.length) {
      const newUserData = {
        id: session.user.id,
        email: session.user.email,
        first_name: customer.data[0].first_name,
        last_name: customer.data[0].last_name,
        cpf_cnpj: customer.data[0].cpf_cnpj,
        phone: customer.data[0].phone,
        avatar: session.user.user_metadata?.avatar_url || null,
      };

      console.log('Setting new user:', newUserData); // ✅ confirm this matches expectations
      setUser(newUserData);
    }
  };

  // Login with email and password
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
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (email, password, name = '') => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
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
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during logout';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Social login (Google, GitHub, etc.)
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

  // Reset password
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

  // Update user profile
  const updateProfile = async (updates) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser((prev) => ({
        ...prev,
        ...updates,
        name: updates.name || prev.name,
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

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Example function showing how to use the API for database calls
  const fetchUserProfile = async (userId) => {
    try {
      const result = await api.get(`/profiles?id=eq.${userId}`);
      return result;
    } catch (error) {
      console.error('Error fetching profile:', error);
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
    api, // Expose the API instance for use in components
    fetchUserProfile, // Example API call
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
