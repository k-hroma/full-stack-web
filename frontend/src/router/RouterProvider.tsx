/**
 * RouterProvider - Componente que provee el router a la app
 * @module router/RouterProvider
 */

import { RouterProvider as RRDRouterProvider } from 'react-router-dom';
import { router } from './router.config';

export function AppRouter() {
  //RRDRouterProvider-> comp de React que activa el enrutamiento
  return <RRDRouterProvider router={router} />;
}