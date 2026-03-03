/**
 * Tipos del AuthContext
 * @module types/authContext
 */

import type { User, LoginCredentials, AuthStatus } from './auth';

export interface AuthContextType {
  // Estado base
  user: User | null;
  status: AuthStatus;
  error: string | null;
  
  // Computed
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  
  // Métodos
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}