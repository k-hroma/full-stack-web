/**
 * Tipos del carrito de compras
 * @module types/cart
 */

import type { Book } from './book';

export interface CartItem {
  book: Book;      // Libro completo
  quantity: number; // Cantidad (por si permitís comprar múltiples ejemplares)
}

export interface CartContextType {
  items: CartItem[];                    // Items en el carrito
  itemCount: number;                    // Total de items (suma de quantities)
  totalPrice: number;                   // Precio total
  addToCart: (book: Book) => void;      // Agregar libro
  removeFromCart: (bookId: string) => void; // Quitar libro
  updateQuantity: (bookId: string, quantity: number) => void; // Cambiar cantidad
  clearCart: () => void;                // Vaciar carrito
  isInCart: (bookId: string) => boolean; // Verificar si está
}