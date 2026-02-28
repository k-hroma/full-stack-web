/**
 * PageWrapper - Wrapper para lazy loading con Suspense
 * @module components/common/PageWrapper
 */

import { Suspense, type ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <Suspense fallback={<div>Cargando página...</div>}>
      {children}
    </Suspense>
  );
}