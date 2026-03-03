/**
 * AuthProvider - Componente proveedor de autenticación
 * @module contexts/AuthProvider
 */

import { useCallback, type ReactNode } from 'react';
import { login as loginApi, logout as logoutApi } from '../api';
import { AuthContext } from './AuthContext';
import { useAuthInit } from '../hooks/useAuthInit';
import type { LoginCredentials } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { 
    user, 
    status, 
    error, 
    refreshSession,
    logoutLocally 
  } = useAuthInit();

  /**
   * Login manual (formulario)
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    await loginApi(credentials);
    await refreshSession();
  }, [refreshSession]);

  /**
   * Logout manual
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutApi();
    } catch {
      // Ignorar errores del backend
    } finally {
      logoutLocally();
    }
  }, [logoutLocally]);

  // Computed properties
  const isAuthenticated = status === 'authenticated';
  const isAdmin = user?.role === 'admin';
  const isLoading = status === 'loading' || status === 'idle';

  const value = {
    user,
    status,
    error,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}