/**
 * ModalContext - Contexto para el BookDetailModal global
 * @module contexts/ModalContext
 */

import { createContext } from 'react';
import type { Book } from '../types/book';

export interface ModalContextType {
  selectedBook: Book | null;
  isOpen: boolean;
  openModal: (book: Book) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);
