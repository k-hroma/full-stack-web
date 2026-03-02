/**
 * Entry point de la aplicación
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './router'; 
import { AuthProvider } from './contexts/AuthProvider';
import { CartProvider } from './contexts/CartProvider';
import { SearchProvider } from './contexts/SearchProvider';
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
        <AppRouter />
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
