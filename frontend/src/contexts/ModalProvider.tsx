/**
 * ModalProvider - Proveedor del estado global del BookDetailModal
 * Debe estar DENTRO de CartProvider (usa useCart)
 * @module contexts/ModalProvider
 */

import { useState, useCallback, type ReactNode } from 'react';
import { ModalContext } from './ModalContext';
import { BookDetailModal } from '../components/bookDetailModal/BookDetailModal';
import { useCart } from '../hooks/useCart';
import type { Book } from '../types/book';

export function ModalProvider({ children }: { children: ReactNode }) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [colorIndex, setColorIndex] = useState<number>(0);

  const { addToCart, isInCart } = useCart();

  const openModal = useCallback((book: Book, index: number): void => {
    setColorIndex(index);
    setSelectedBook(book);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsOpen(false);
    setSelectedBook(null);
    setColorIndex(0);
  }, []);

  return (
    <ModalContext.Provider value={{ selectedBook, isOpen, colorIndex, openModal, closeModal }}>
      {children}
      {isOpen && selectedBook && (
        <BookDetailModal
          colorIndex={colorIndex}
          book={selectedBook}
          isOpen={isOpen}
          onClose={closeModal}
          onAddToCart={() => addToCart(selectedBook)}
          isInCart={isInCart(selectedBook._id)}
        />
      )}
    </ModalContext.Provider>
  );
}
