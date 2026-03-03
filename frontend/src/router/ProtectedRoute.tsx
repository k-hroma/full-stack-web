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
  //(doRefresh está corriendo en el fondo) 
  if (isLoading) {
    return (
      <div>
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
        state={{ from: location.pathname }} //guarda de donde venia
      />
    );
  }

  // Hay sesión pero no es admin: (usuario común intenta entrar a /admin)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Autorizado
  return <Outlet />;
}