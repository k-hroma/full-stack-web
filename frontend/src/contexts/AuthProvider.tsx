/**
 * AuthProvider - Componente proveedor de autenticación
 * @module contexts/AuthProvider
 */

import { useState, useCallback, type ReactNode } from 'react';
import { login as loginApi, logout as logoutApi } from '../api';
import { AuthContext } from './AuthContext';
import type { User, LoginCredentials, ApiError } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useCallback para guardar en memoria la funcion una sola vez y no cada vez que el componente renderiza
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      //	LLAMADA AL BACKEND —../api/auth.ts
      const userData = await loginApi(credentials);
      setUser(userData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Error al iniciar sesión');
      //Re-lanza el error para que LoginPage también lo capture
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await logoutApi();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}