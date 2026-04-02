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
import { ErrorBoundary } from './components/error';
import { ErrorFallback } from './components/error';
import './styles/index.css';
import './styles/fonts.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<ErrorFallback />}>
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
    </ErrorBoundary>
  </StrictMode>
);

