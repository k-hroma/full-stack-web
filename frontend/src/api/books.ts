/**
 * Endpoints de libros
 * @module api/books
 */

import { httpClient } from './client';
import type {
  Book,
  BooksResponse,
  BookResponse,
  CreateBookInput,
  UpdateBookInput,
  BookFilters,
} from '../types';

/**
 * Obtiene todos los libros, opcionalmente filtrados
 */
export const getBooks = async (filters?: BookFilters): Promise<Book[]> => {
  // Construir query string
  const params = new URLSearchParams();
  if (filters?.fanzine !== undefined) {
    params.append('fanzine', String(filters.fanzine));
  }
  if (filters?.latestBook !== undefined) {
    params.append('latestBook', String(filters.latestBook));
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await httpClient<BooksResponse>(`/books${query}`);
  
  return response.data;
};

/**
 * Busca libros por término (título, autor, editorial, ISBN)
 */
export const searchBooks = async (term: string): Promise<Book[]> => {
  const response = await httpClient<BooksResponse>(
    `/books/search?term=${encodeURIComponent(term)}`
  );
  return response.data;
};

/**
 * Obtiene un libro por ID
 */
export const getBookById = async (id: string): Promise<Book> => {
  const response = await httpClient<BookResponse>(`/books/${id}`);
  return response.data;
};

/**
 * Crea un nuevo libro (solo admin)
 */
export const createBook = async (book: CreateBookInput): Promise<Book> => {
  const response = await httpClient<BookResponse>('/books', {
    method: 'POST',
    body: JSON.stringify(book),
  });
  return response.data;
};

/**
 * Actualiza un libro existente (solo admin)
 */
export const updateBook = async (
  id: string,
  updates: UpdateBookInput
): Promise<Book> => {
  const response = await httpClient<BookResponse>(`/books/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return response.data;
};

/**
 * Elimina un libro (solo admin)
 */
export const deleteBook = async (id: string): Promise<void> => {
  await httpClient(`/books/${id}`, {
    method: 'DELETE',
  });
};