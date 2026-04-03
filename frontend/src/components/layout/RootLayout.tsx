/**
 * RootLayout - Layout principal de la tienda
 * @module components/layout/RootLayout
 */

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ScrollToTop } from '../common/ScrollToTop';
import '../../styles/layout/root-layout.css';

export function RootLayout() {
  return (
    <div className="layout">
      <ScrollToTop />
      <Header />
      <main className="main-content">
        <Suspense fallback={
          <div className="loading-fallback">
            <LoadingSpinner fullScreen={false} text="Cargando" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}