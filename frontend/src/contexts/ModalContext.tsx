/**
 * ModalContext - Contexto para el BookDetailModal global
 * @module contexts/ModalContext
 */

import { createContext } from 'react';
import type { Book } from '../types/book';

export interface ModalContextType {
  selectedBook: Book | null;
  isOpen: boolean;
  colorIndex: number;
  openModal: (book: Book, colorIndex: number) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);
