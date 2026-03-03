/**
 * ProtectedRoute - Guard de rutas protegidas
 * @module router/ProtectedRoute
 */

import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente que protege rutas de administrador
 */
export function ProtectedRoute(): ReactElement {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Si estamos verificando la sesión inicial, mostramos spinner
  // Esto evita el "flash de login" al recargar estando autenticado
  if (isLoading) {
    return (
      <div className="protected-route__loading" aria-live="polite">
        <span>Verificando sesión...</span>
      </div>
    );
  }

  // Verificación completada: no hay sesión
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: location.pathname }} 
      />
    );
  }

  // Hay sesión pero no es admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Autorizado
  return <Outlet />;
}