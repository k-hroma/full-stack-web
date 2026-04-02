/**
 * useModal - Hook para usar el ModalContext
 * @module hooks/useModal
 */

import { useContext } from 'react';
import { ModalContext } from '../contexts/ModalContext';
import type { ModalContextType } from '../contexts/ModalContext';

export function useModal(): ModalContextType {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal debe usarse dentro de ModalProvider');
  }
  return context;
}
