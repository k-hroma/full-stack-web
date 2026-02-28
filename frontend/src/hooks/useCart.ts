/**
 * Hook para usar el CartContext
 * @module hooks/useCart
 */

import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import type { CartContextType } from '../types/cart';

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}