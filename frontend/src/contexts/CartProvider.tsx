/**
 * CartProvider - Estado del carrito con localStorage
 * @module contexts/CartProvider
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { CartContext } from './CartContext';
import type { CartItem } from '../types/cart';
import type { Book } from '../types';

const STORAGE_KEY = 'libreria_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  // Inicializar desde localStorage (o vacío)
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Guardar en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Calcular totales
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);

  // Agregar libro al carrito
  const addToCart = useCallback((book: Book) => {
    setItems(current => {
      const existing = current.find(item => item.book._id === book._id);
      
      if (existing) {
        // Ya está, aumentar cantidad (si hay stock)
        if (book.stock && existing.quantity >= book.stock) {
          return current; // No hay más stock
        }
        return current.map(item =>
          item.book._id === book._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // No está, agregar nuevo
      return [...current, { book, quantity: 1 }];
    });
  }, []);

  // Quitar libro del carrito
  const removeFromCart = useCallback((bookId: string) => {
    setItems(current => current.filter(item => item.book._id !== bookId));
  }, []);

  // Actualizar cantidad específica
  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(bookId);
      return;
    }
    
    setItems(current =>
      current.map(item =>
        item.book._id === bookId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  // Vaciar carrito
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Verificar si un libro está en el carrito
  const isInCart = useCallback((bookId: string) => {
    return items.some(item => item.book._id === bookId);
  }, [items]);

  const value = {
    items,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}