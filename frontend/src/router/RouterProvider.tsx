/**
 * RouterProvider - Componente que provee el router a la app
 * @module router/RouterProvider
 */

import { RouterProvider as RRDRouterProvider } from 'react-router-dom';
import { router } from './router.config';

export function AppRouter() {
  return <RRDRouterProvider router={router} />;
}