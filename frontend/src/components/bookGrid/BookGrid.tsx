/**
 * BookGrid - Componente reutilizable para grillas de libros
 * Unifica: AllLatestBooks, Fanzines, OnlyBooks, CatalogPage
 * @module components/bookGrid/BookGrid
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../../api';
import { useCart } from '../../hooks/useCart';
import { useModal } from '../../hooks/useModal';
import { BookCard } from '../bookCard/BookCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { Book, BookFilters } from '../../types/book';
import '../../styles/pages/public/grid-books.css';

interface BookGridProps {
  title: string;
  filter?: BookFilters;
  showBackLink?: boolean;
  maxItems?: number;
  sortFn?: (a: Book, b: Book) => number;
}

const BookGrid = ({
  title,
  filter,
  showBackLink = false,
  maxItems,
  sortFn,
}: BookGridProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart, isInCart } = useCart();
  const { openModal } = useModal();

  useEffect(() => {
    const loadBooks = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        let data = await getBooks(filter);
        if (sortFn) {
          data = [...data].sort(sortFn);
        }
        if (maxItems !== undefined) {
          data = data.slice(0, maxItems);
        }
        setBooks(data);
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : 'Error al cargar los libros';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <div className="page-loading-container">
    <LoadingSpinner fullScreen={false} text="Cargando" />
  </div>;
  if (error) return <div>{error}</div>;

  return (
    <section className="books-container">
      <div className="txt-section-container">
        <h2 className="section-title">{title}</h2>
        {showBackLink && (
          <Link className="link-return" to="/">
            Volver
          </Link>
        )}
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
}

export { BookGrid };