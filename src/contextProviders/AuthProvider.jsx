import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../SupabaseConfiguration';
import useFetch from '../customHooks/useFetch';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        let customer = null;

        if (session) {
          try {
            const res = await api.get(
              `/customers?select=*&user_id=eq.${session.user.id}`
            );
            customer = res.data?.[0];
          } catch (error) {
            console.log('Erro no customer:', error);
          }
        }

        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
        } else if (session?.user && customer) {
          setUser({
            user_id: session.user.id,
            customer_id: customer.id,
            email: session.user.email,
            first_name:
              customer.first_name ||
              session.user.email?.split('@')[0] ||
              'User',
            last_name:
              customer.last_name || session.user.email?.split('@')[0] || 'User',
            cpf_cnpj: customer.cpf_cnpj,
            phone: customer.phone,
            avatar: session.user.user_metadata?.avatar_url || null,
            updated_at: customer.updated_at,
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        let customer = null;

        try {
          const res = await api.get(
            `/customers?select=*&user_id=eq.${session.user.id}`
          );
          customer = res.data?.[0];
        } catch (err) {
          console.log('Erro no customer (auth change):', err);
        }

        if (customer) {
          const incoming = new Date(customer.updated_at);
          const current = user?.updated_at ? new Date(user.updated_at) : null;

          const isNewer = !current || incoming > current;

          if (isNewer) {
            setUser({
              ...user,
              user_id: session.user.id,
              customer_id: customer.id,
              email: session.user.email,
              first_name: customer.first_name,
              last_name: customer.last_name,
              cpf_cnpj: customer.cpf_cnpj,
              phone: customer.phone,
              avatar: session.user.user_metadata?.avatar_url || null,
              updated_at: customer.updated_at,
            });

            setIsLoggedIn(true);
          } else {
            console.log('Ignored stale customer overwrite');
          }
        }
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

  const refreshUser = async (forceData = null) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let customer;
    if (forceData) {
      customer = { ...forceData };
    } else {
      const res = await api.get(
        `/customers?select=*&user_id=eq.${session.user.id}`
      );
      customer = res.data?.[0];
    }

    if (customer) {
      setUser((prev) => ({
        ...prev,
        ...customer,
        email: session.user.email,
        avatar: session.user.user_metadata?.avatar_url || null,
      }));
    }
  };

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

  const clearError = () => {
    setError(null);
  };

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
    api,
    fetchUserProfile,
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
