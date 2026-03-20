/**
 * CatalogPage - Página de catálogo de libros
 * Conecta con GET /books del backend
 * @module pages/public/CatalogPage
 */

import { useState, useEffect } from 'react';
import { getBooks } from '../../api';
import { useCart } from '../../hooks/useCart';
import { BookCard } from '../../components/bookCard/BookCard';
import { BookDetailModal } from '../../components/bookDetailModal/BookDetailModal';
import type { Book } from '../../types/book';
import '../../styles/pages/public/grid-books.css'



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

  const handleViewMore = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  if (isLoading) return <div className='link-return'>Cargando...</div>;
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
          if (selectedBook) {
            addToCart(selectedBook);
          }
        }}
        isInCart={selectedBook ? isInCart(selectedBook._id) : false}
      />
    </section>
  );
}

export { LatestBooks }