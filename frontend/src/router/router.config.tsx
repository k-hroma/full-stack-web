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
const AllLatestBooks = lazy(() => import('../pages/public/AllLatestBooks'));
const CatalogPage = lazy(() => import('../pages/public/CatalogPage'));
const ResultsPage = lazy(() => import('../pages/public/ResultsSearchPage'));
const Fanzines = lazy(() => import('../pages/public/Fanzines'));
const CartPage = lazy(() => import('../pages/public/CartPage'));
const LoginPage = lazy(() => import('../pages/public/LoginPage'));
const RegisterPage = lazy(() => import('../pages/public/RegisterPage'));
const OnlyBooks = lazy(() => import('../pages/public/OnlyBooks'));
const AllWriters = lazy(() => import('../pages/public/AllWriters'));
const ContactFormPage = lazy(() => import('../pages/public/ContactFormPage'));
const AboutUs = lazy(() => import('../pages/public/AboutUs'));

// Páginas admin (lazy loading)
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminRegisterPage = lazy(() => import('../pages/admin/AdminRegisterPage'));

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
        path: 'register',
        element: (
          <PageWrapper>
            <RegisterPage />
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
      {
        path: 'catalogo',
        element: (
          <PageWrapper>
            <CatalogPage />
          </PageWrapper>
        ),
      }, {
        path: 'results',
        element: (
          <PageWrapper>
            <ResultsPage />
          </PageWrapper>
        ),
      }, {
        path: 'novedades',
        element: (
          <PageWrapper>
            <AllLatestBooks />
          </PageWrapper>
        ),
      }, {
        path: 'fanzines',
        element: (
          <PageWrapper>
            <Fanzines />
          </PageWrapper>
        ),
      }, {
        path: 'libros',
        element: (
          <PageWrapper>
            <OnlyBooks />
          </PageWrapper>
        ),
      }, {
        path: 'escritorxs',
        element: (
          <PageWrapper>
            <AllWriters />
          </PageWrapper>
        ),
      }, {
        path: 'contacto',
        element: (
          <PageWrapper>
            <ContactFormPage />
          </PageWrapper>
        ),
      },
      {
        path: 'nosotrxs',
        element: (
          <PageWrapper>
            <AboutUs />
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
              {
                path: 'register-admin',
                element: (
                  <PageWrapper>
                    <AdminRegisterPage />
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