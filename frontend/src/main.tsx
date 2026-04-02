/**
 * Entry point de la aplicación
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './router';
import { AuthProvider } from './contexts/AuthProvider';
import { CartProvider } from './contexts/CartProvider';
import { ModalProvider } from './contexts/ModalProvider';
import { SearchProvider } from './contexts/SearchProvider';
import { SearchWriterProvider } from './contexts/SearchWriterProvider';
import './styles/index.css';
import './styles/fonts.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ModalProvider>
          <SearchWriterProvider>
            <SearchProvider>
              <AppRouter />
            </SearchProvider>
          </SearchWriterProvider>
        </ModalProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
