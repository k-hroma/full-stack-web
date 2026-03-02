/**
 * ProtectedRoute - Guard de rutas protegidas
 * @module router/ProtectedRoute
 */

import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation, type RouteObject } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente que protege rutas de administrador
 * Verifica autenticación y rol admin antes de renderizar
 * 
 * @returns {ReactElement} Navigate (redirección) o Outlet (ruta permitida)
 */
export function ProtectedRoute(): ReactElement {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation()

  // Mientras verifica auth, mostrar estado de carga
  if (isLoading) {
    return <div aria-live="polite">Cargando...</div>;
  }

  // No autenticado → redirigir a login pero guardar de dónde viene
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Autenticado pero no admin → redirigir a home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Autorizado → renderizar ruta hija
  return <Outlet />;
}

/**
 * Tipo para configuración de rutas protegidas
 * Utilizado en la configuración del router
 */
export type ProtectedRouteObject = RouteObject & {
  element: typeof ProtectedRoute;
};