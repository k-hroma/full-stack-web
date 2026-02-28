/**
 * Configuración del router
 * @module router/router.config
 */

import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PageWrapper } from '../components/common/PageWrapper';

// Layouts
import { RootLayout } from '../components/layout/RootLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

// Páginas públicas (lazy loading)
import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/public/HomePage'));
const CartPage = lazy(() => import('../pages/public/CartPage'));
const LoginPage = lazy(() => import('../pages/public/LoginPage'));

// Páginas admin (lazy loading)
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));

// Configuración de rutas 
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // RUTAS PÚBLICAS
      {
        index: true,
        element: (
          <PageWrapper>
            <HomePage />
          </PageWrapper>
        ),
      },
      {
        path: 'cart',
        element: (
          <PageWrapper>
            <CartPage />
          </PageWrapper>
        ),
      },
      {
        path: 'login',
        element: (
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        ),
      },
      
      // RUTAS PROTEGIDAS (ADMIN)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: (
                  <PageWrapper>
                    <AdminDashboardPage />
                  </PageWrapper>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);