/**
 * Endpoints de libros
 * @module api/books
 *
 * Estrategia de caché:
 *   getBooks(filters)          → cachea por query string  (TTL: 5 min)
 *   getBookById(id)            → cachea por ID            (TTL: 10 min)
 *   getBooksByAuthor(ln, fn)   → cachea por autor         (TTL: 5 min)
 *   searchBooks(term)          → NUNCA cachea             (resultado por input de usuario)
 *   createBook / updateBook / deleteBook → invalidan el prefijo 'books:'
 */

import { httpClient } from './client';
import { cache, TTL, KEYS } from '../utils/dataCache';
import type {
  Book,
  BooksResponse,
  BookResponse,
  CreateBookInput,
  UpdateBookInput,
  BookFilters,
} from '../types';

// ─── Helpers de clave ─────────────────────────────────────────────────────────

/**
 * Genera una clave de caché estable para un filtro dado.
 * JSON.stringify con keys ordenadas garantiza que
 * { fanzine: true, latestBook: false } y { latestBook: false, fanzine: true }
 * produzcan la misma clave.
 */
function booksListKey(filters?: BookFilters): string {
  if (!filters || Object.keys(filters).length === 0) {
    return `${KEYS.BOOKS}list:all`;
  }
  const sorted = Object.fromEntries(
    Object.entries(filters).sort(([a], [b]) => a.localeCompare(b))
  );
  return `${KEYS.BOOKS}list:${JSON.stringify(sorted)}`;
}

function bookIdKey(id: string): string {
  return `${KEYS.BOOKS}id:${id}`;
}

function bookAuthorKey(lastName: string, firstName: string): string {
  return `${KEYS.BOOKS}author:${lastName.toLowerCase()}:${firstName.toLowerCase()}`;
}

// ─── Reads (con caché) ────────────────────────────────────────────────────────

/**
 * Obtiene todos los libros, opcionalmente filtrados.
 * Cachea el resultado 5 minutos por combinación de filtros.
 */
export const getBooks = async (filters?: BookFilters): Promise<Book[]> => {
  const key = booksListKey(filters);
  const cached = cache.get<Book[]>(key);
  if (cached) return cached;

  const params = new URLSearchParams();
  if (filters?.fanzine    !== undefined) params.append('fanzine',     String(filters.fanzine));
  if (filters?.latestBook !== undefined) params.append('latestBook',  String(filters.latestBook));
  if (filters?.showInHome !== undefined) params.append('showInHome',  String(filters.showInHome));

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await httpClient<BooksResponse>(`/books${query}`);

  cache.set(key, response.data, TTL.LIST);
  return response.data;
};

/**
 * Obtiene un libro por ID.
 * Cachea 10 minutos; se invalida automáticamente al actualizar o eliminar.
 */
export const getBookById = async (id: string): Promise<Book> => {
  const key = bookIdKey(id);
  const cached = cache.get<Book>(key);
  if (cached) return cached;

  const response = await httpClient<BookResponse>(`/books/${id}`);
  cache.set(key, response.data, TTL.ITEM);
  return response.data;
};

/**
 * Obtiene libros por nombre y apellido del autor.
 * Cachea 5 minutos por par apellido+nombre.
 */
export const getBooksByAuthor = async (
  lastName: string,
  firstName: string,
): Promise<Book[]> => {
  const key = bookAuthorKey(lastName, firstName);
  const cached = cache.get<Book[]>(key);
  if (cached) return cached;

  const params = new URLSearchParams({ lastName, firstName });
  const response = await httpClient<BooksResponse>(`/books/author?${params.toString()}`);

  cache.set(key, response.data, TTL.LIST);
  return response.data;
};

/**
 * Obtiene libros por categoría específica.
 * Delega a getBooks → hereda su caché.
 */
export const getBooksByCategory = async (
  category: 'latestBook' | 'fanzine' | 'showInHome' | 'all',
): Promise<Book[]> => {
  const filters: BookFilters = { [category]: true };
  return getBooks(filters);
};

// ─── Búsqueda (SIN caché — depende del input del usuario) ────────────────────

/**
 * Busca libros por término. No se cachea intencionalmente:
 * los resultados deben ser siempre frescos según lo que escribe el usuario.
 */
export const searchBooks = async (term: string): Promise<Book[]> => {
  const response = await httpClient<BooksResponse>(
    `/books/search?term=${encodeURIComponent(term)}`,
  );
  return response.data;
};

// ─── Mutaciones (invalidan caché) ─────────────────────────────────────────────

/**
 * Crea un nuevo libro (solo admin).
 * Invalida todo el prefijo 'books:' para que los listados se refresquen.
 */
export const createBook = async (book: CreateBookInput): Promise<Book> => {
  const response = await httpClient<BookResponse>('/books', {
    method: 'POST',
    body: JSON.stringify(book),
  });
  cache.invalidatePrefix(KEYS.BOOKS);
  return response.data;
};

/**
 * Actualiza un libro existente (solo admin).
 * Invalida el item concreto + todos los listados.
 */
export const updateBook = async (
  id: string,
  updates: UpdateBookInput,
): Promise<Book> => {
  const response = await httpClient<BookResponse>(`/books/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  // Invalida todo: el item actualizado Y todos los listados que podían incluirlo
  cache.invalidatePrefix(KEYS.BOOKS);
  return response.data;
};

/**
 * Elimina un libro (solo admin).
 * Invalida todo el prefijo 'books:'.
 */
export const deleteBook = async (id: string): Promise<void> => {
  await httpClient(`/books/${id}`, { method: 'DELETE' });
  cache.invalidatePrefix(KEYS.BOOKS);
};
