/**
 * LatestBooks - Sección de novedades en Home
 * Conecta con GET /books del backend
 * @module pages/public/LatestBooks
 */

import { useState, useEffect } from 'react';
import { getBooks } from '../../api';
import { useCart } from '../../hooks/useCart';
import { BookCard } from '../../components/bookCard/BookCard';
import { BookDetailModal } from '../../components/bookDetailModal/BookDetailModal';
import { optimizeImageUrl } from '../../utils/cloudinaryHelpers';
import type { Book } from '../../types/book';
import '../../styles/pages/public/grid-books.css'
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

// Dimensiones que usa BookCard (deben coincidir con CARD_W / CARD_H en BookCard.tsx)
const CARD_W = 130;
const CARD_H = 195;

// Cuántas imágenes precargamos con alta prioridad
const PRELOAD_COUNT = 4;

/**
 * Inyecta <link rel="preload"> en el <head> para las primeras N imágenes de
 * libros una vez que se conocen sus URLs. Devuelve un cleanup que los elimina
 * si el componente se desmonta (evita fugas entre navegaciones SPA).
 */
function preloadBookImages(books: Book[]): () => void {
  const links: HTMLLinkElement[] = [];

  books.slice(0, PRELOAD_COUNT).forEach((book) => {
    if (!book.img) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    // Optimizar a las dimensiones reales que usará BookCard
    link.href = optimizeImageUrl(book.img, { width: CARD_W, height: CARD_H, quality: 'auto:good' });
    // fetchpriority="high" para que el navegador las trate como críticas
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    links.push(link);
  });

  return () => {
    links.forEach((link) => {
      if (document.head.contains(link)) document.head.removeChild(link);
    });
  };
}

const LatestBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getBooks({ showInHome: true });
        const sortedBooks = data.sort((a, b) => {
          if (a.homeOrder && b.homeOrder) return a.homeOrder - b.homeOrder;
          if (a.homeOrder) return -1;
          if (b.homeOrder) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        const limitedBooks = sortedBooks.slice(0, 8);
        setBooks(limitedBooks);
      } catch (error) {
        const errMsg = error instanceof Error
          ? error.message
          : 'Error al cargar los libros';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Una vez que los libros están disponibles, precargar las primeras 4 portadas
  useEffect(() => {
    if (books.length === 0) return;
    const cleanup = preloadBookImages(books);
    return cleanup;
  }, [books]);

  const handleViewMore = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  if (isLoading) return <div className='page-loading-container'>
    <LoadingSpinner fullScreen={false} text="Cargando" />
  </div>;
  if (error) return <div>{error}</div>;

  return (
    <section className='books-container'>
      <div className="txt-section-container">
        <h2 className="section-title">Novedades</h2>
      </div>
      <div className="grid-container">
        {books.length === 0
          ? (<p className='link-return'>No hay libros disponibles.</p>)
          : (
            books.map((book, index) => (
              <BookCard
                key={book._id}
                index={index}
                book={book}
                isInCart={isInCart(book._id)}
                onAddToCart={() => addToCart(book)}
                onViewMore={() => handleViewMore(book)}
              />
            ))
          )}
      </div>
      <BookDetailModal
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={() => {
          if (selectedBook) addToCart(selectedBook);
        }}
        isInCart={selectedBook ? isInCart(selectedBook._id) : false}
      />
    </section>
  );
}

export { LatestBooks }
