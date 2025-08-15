import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from '../SupabaseConfiguration';
import useFetch from '../customHooks/useFetch';
import useSessionTimeout from '../customHooks/useSessionTimeout';
import { useModalActions } from './ModalProvider';
import type { Session, User, Provider, AuthError } from '@supabase/supabase-js';

// ==========================
// Types
// ==========================

export interface Address {
  id?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  [key: string]: any;
}

export interface Customer {
  id?: string;
  first_name?: string;
  last_name?: string;
  cpf_cnpj?: string;
  phone?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Cart {
  id: string;
  [key: string]: any;
}

export interface AuthUser {
  user_id: string;
  customer_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  cpf_cnpj: string;
  phone: string;
  avatar: string | null;
  updated_at: string;
  addresses: Address[];
  cart_id: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  refreshUser: () => Promise<void>;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string; user?: User | null }>;
  logout: () => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    updates: Record<string, any>
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  clearError: () => void;
  api: ReturnType<typeof useFetch>;
  fetchUserProfile: (userId: string) => Promise<any>;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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
    (
      sessionUser: User,
      customer: Customer | null = null,
      addresses: Address[] = [],
      cart: Cart | null = null
    ): AuthUser | null => {
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
        avatar: (sessionUser.user_metadata as any)?.avatar_url || null,
        updated_at: customer?.updated_at || new Date().toISOString(),
        addresses: Array.isArray(addresses) ? [...addresses] : [],
        cart_id: cart?.id || '',
      };
    },
    []
  );

  // Fetch user data from database
  const fetchUserData = useCallback(
    async (sessionUser: User): Promise<AuthUser | null> => {
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
        let addresses: Address[] = [];
        try {
          const { data: customerAddressData } = await api.get(
            `/customer_addresses?customer_id=eq.${customerData.id}`
          );
          addresses = customerAddressData || [];
        } catch (addressErr: any) {
          showAlert({
            title: 'Error',
            message: String(addressErr),
            onClose: () => {},
            onCountdownComplete: () => {},
          });
        }

        return buildUserObject(sessionUser, customerData, addresses, cartData);
      } catch {
        return buildUserObject(sessionUser);
      }
    },
    [buildUserObject]
  );

  // Handle auth state changes
  const handleAuthStateChange = useCallback(
    async (event: string, newSession: Session | null) => {
      try {
        setSession(newSession);

        if (event === 'SIGNED_OUT' || !newSession?.user) {
          setUser(null);
          setIsLoggedIn(false);
          setError(null);
          setLoading(false);
          return;
        }

        if (event === 'INITIAL_SESSION') {
          setLoading(true);
          const userData = await fetchUserData(newSession.user);
          setUser(userData);
          setIsLoggedIn(!!userData);
        }

        if (event === 'TOKEN_REFRESHED') {
          if (user?.user_id !== newSession.user.id) {
            const userData = await fetchUserData(newSession.user);
            setUser(userData);
            setIsLoggedIn(!!userData);
          }
        }

        if (event === 'SIGNED_IN') {
          return;
        }
      } catch (err: any) {
        setError(err.message || 'Authentication error occurred');
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        if (event !== 'SIGNED_IN') {
          setLoading(false);
        }
      }
    },
    [fetchUserData, user?.user_id]
  );

  // Auth listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    return () => {
      subscription?.unsubscribe();
    };
  }, [handleAuthStateChange]);

  // Session timeout handler
  const handleSessionExpired = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    setSession(null);
    setError(null);
  }, []);

  useSessionTimeout(session, handleSessionExpired);

  // Refresh user
  const refreshUser = useCallback(async () => {
    if (!session?.user) return;
    try {
      const userData = await fetchUserData(session.user);
      setUser(userData);
      setIsLoggedIn(!!userData);
    } catch (error: any) {
      setError(error.message || 'Failed to refresh user data');
    }
  }, [session?.user, fetchUserData]);

  // Auth functions
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user };
    } catch {
      const errorMessage = 'An unexpected error occurred during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email: string, password: string, name = '') => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user };
    } catch {
      const errorMessage = 'An unexpected error occurred during registration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      setUser(null);
      setIsLoggedIn(false);
      setSession(null);
    }
  };

  const loginWithProvider = async (provider: Provider) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      const errorMessage = `An unexpected error occurred during ${provider} login`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      const errorMessage = 'An unexpected error occurred during password reset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: updates });
      if (error) return { success: false, error: error.message };

      // Instead of shallow update, refresh full user info:
      if (session?.user) {
        const userData = await fetchUserData(session.user);
        setUser(userData);
        setIsLoggedIn(!!userData);
      }

      return { success: true, user: data.user };
    } catch {
      const errorMessage = 'An unexpected error occurred during profile update';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => setError(null), []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const result = await api.get(`/profiles?id=eq.${userId}`);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    refreshUser,
    isLoggedIn,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    clearError,
    api,
    fetchUserProfile,
    session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
