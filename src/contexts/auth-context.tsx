import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);
  const inflightRef = useRef<Promise<User> | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.adminLogin({ email, password });
    localStorage.setItem('auth_token', data.accessToken);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    if (!inflightRef.current) {
      inflightRef.current = authApi.getMe();
    }

    inflightRef.current.then(
      (userData) => {
        inflightRef.current = null;
        if (!cancelled) {
          // Only allow ADMIN users in the admin panel
          if (userData.role !== 'ADMIN') {
            logout();
            setIsLoading(false);
            return;
          }
          setUser(userData);
          setIsLoading(false);
        }
      },
      () => {
        inflightRef.current = null;
        if (!cancelled) {
          logout();
          setIsLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
