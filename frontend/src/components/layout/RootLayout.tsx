/**
 * RootLayout - Layout principal de la tienda
 * @module components/layout/RootLayout
 */

import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollToTop } from '../common/ScrollToTop';

export function RootLayout() {
  return (
    <div className="layout">
      <ScrollToTop />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}