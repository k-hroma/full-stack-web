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
    user,  //datos del usuario (o null) {id, name}
    status, // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
    error, 
    refreshSession, //refresca el token
    logoutLocally  //limpia el estado local
  } = useAuthInit(); //hook que se ejecuta inmediatamente cuando la app carga

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

  // Computed properties :Estas variables derivan del status base *useAuthInit()
  const isAuthenticated = status === 'authenticated';
  const isAdmin = user?.role === 'admin';
  const isLoading = status === 'loading' || status === 'idle';

  const value = {
    user,
    status,
    error,
    isAuthenticated,  // ← true solo cuando status === 'authenticated'
    isAdmin,  // ← true solo cuando user.role === 'admin'
    isLoading,  // ← true mientras status sea 'loading' o 'idle'
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