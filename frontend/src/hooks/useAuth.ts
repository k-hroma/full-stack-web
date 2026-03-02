/**
 * Hook para usar el AuthContext
 * @module hooks/useAuth
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../types/authContext'

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}