/**
 * BookGrid - Componente reutilizable para grillas de libros
 * Unifica: AllLatestBooks, Fanzines, OnlyBooks, CatalogPage, LatestBooks
 * @module components/bookGrid/BookGrid
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../../api';
import { useCart } from '../../hooks/useCart';
import { useModal } from '../../hooks/useModal';
import { BookCard } from '../bookCard/BookCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { optimizeImageUrl } from '../../utils/cloudinaryHelpers';
import type { Book, BookFilters } from '../../types/book';
import '../../styles/pages/public/grid-books.css';

// Dimensiones base de BookCard — deben coincidir con CARD_W / CARD_H en BookCard.tsx
const CARD_W = 130;
const CARD_H = 195;

/**
 * Inyecta <link rel="preload"> en el <head> para las primeras N imágenes.
 * Devuelve cleanup que los elimina si el componente se desmonta (evita fugas en SPA).
 */
function preloadBookImages(books: Book[], count: number): () => void {
  const links: HTMLLinkElement[] = [];

  books.slice(0, count).forEach((book) => {
    if (!book.img) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizeImageUrl(book.img, { width: CARD_W, height: CARD_H, quality: 'auto:good' });
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    links.push(link);
  });

  return () => {
    links.forEach((l) => {
      if (document.head.contains(l)) document.head.removeChild(l);
    });
  };
}

interface BookGridProps {
  title: string;
  filter?: BookFilters;
  showBackLink?: boolean;
  maxItems?: number;
  sortFn?: (a: Book, b: Book) => number;
  /**
   * Número de imágenes iniciales a precargar con alta prioridad.
   * Usá 4 en la home (mejora LCP), 0 en el resto (default).
   */
  preloadFirst?: number;
}

const BookGrid = ({
  title,
  filter,
  showBackLink = false,
  maxItems,
  sortFn,
  preloadFirst = 0,
}: BookGridProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart, isInCart } = useCart();
  const { openModal } = useModal();

  // ─── Refs para valores que no deben disparar re-fetch ─────────────────────
  // filter y sortFn se acceden dentro del efecto vía ref para tener siempre
  // el valor más reciente sin que sean dependencias que causen loops infinitos.
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const sortFnRef = useRef(sortFn);
  sortFnRef.current = sortFn;

  // ─── Clave estable de filtro ───────────────────────────────────────────────
  // JSON.stringify garantiza que { latestBook: true } pasado como objeto nuevo
  // en cada render NO dispare un fetch si el contenido no cambió.
  const filterKey = JSON.stringify(filter ?? null);

  // ─── Fetch de libros ───────────────────────────────────────────────────────
  useEffect(() => {
    // cancelled evita que un fetch tardío actualice el estado después de desmontar
    let cancelled = false;

    const loadBooks = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        let data = await getBooks(filterRef.current);

        if (cancelled) return;

        if (sortFnRef.current) {
          data = [...data].sort(sortFnRef.current);
        }
        if (maxItems !== undefined) {
          data = data.slice(0, maxItems);
        }

        setBooks(data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Error al cargar los libros');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadBooks();
    return () => { cancelled = true; };

    // sortFn se accede vía sortFnRef → no necesita ser dependencia.
    // maxItems es un primitivo → dependencia segura.
  }, [filterKey, maxItems]);

  // ─── Preload de imágenes críticas ─────────────────────────────────────────
  useEffect(() => {
    if (books.length === 0 || preloadFirst === 0) return;
    return preloadBookImages(books, preloadFirst);
  }, [books, preloadFirst]);

  if (isLoading) return (
    <div className="page-loading-container">
      <LoadingSpinner fullScreen={false} text="Cargando" />
    </div>
  );

  if (error) return <div>{error}</div>;

  return (
    <section className="books-container">
      <div className="txt-section-container">
        <h2 className="section-title">{title}</h2>
        {showBackLink ?
          <Link className="link-return" to="/">
            Volver
          </Link>
          :
          <Link className="link-return" to="/novedades">
            Ver más →
          </Link>
        }
      </div>

      <div className="grid-container">
        {books.length === 0 ? (
          <p className="link-return">No hay libros disponibles.</p>
        ) : (
          books.map((book: Book, index: number) => (
            <BookCard
              key={book._id}
              index={index}
              book={book}
              isInCart={isInCart(book._id)}
              onAddToCart={() => addToCart(book)}
              onViewMore={() => openModal(book)}
            />
          ))
        )}
      </div>
    </section>
  );
};

export { BookGrid };
