/**
 * Tipos del AuthContext
 * @module types/authContext
 */

import type { User, LoginCredentials } from './auth';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}