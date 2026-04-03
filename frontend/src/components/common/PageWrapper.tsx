/**
 * PageWrapper - Wrapper para lazy loading con Suspense
 * @module components/common/PageWrapper
 */

import { Suspense, type ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <Suspense fallback={<div className="loading-fallback">
      <LoadingSpinner fullScreen={false} text="Cargando" />
    </div>}>
      {children}
    </Suspense>
  );
}