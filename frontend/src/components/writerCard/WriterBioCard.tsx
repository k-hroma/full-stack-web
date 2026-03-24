import { BookDetailModal } from '../bookDetailModal/BookDetailModal';
import { useCart } from '../../hooks/useCart';
import '../../styles/pages/public/writer-bio-card.css'
import { useEffect, useState } from 'react';
import type { Writer } from '../../types/writer';
import { getBooksByAuthor } from '../../api';
import type { Book } from '../../types';

interface WriterBioCardProps {
  writer: Writer;
}

export default function WriterBioCard({ writer }: WriterBioCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const { addToCart, isInCart } = useCart();

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = (book: Book) => {
    setSelectedBook(book);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setSelectedBook(null); // Limpiar el libro seleccionado
  };


  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Usar el writer que viene por props para filtrar
        const data = await getBooksByAuthor(writer.lastName, writer.firstName);
        setBooks(data);
      } catch (error) {
        const errMsg = error instanceof Error
          ? error.message
          : 'Error al cargar los libros';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    }

    // Solo cargar si tenemos el writer
    if (writer.lastName && writer.firstName) {
      loadBooks();
    }
  }, [writer.lastName, writer.firstName]); // Dependencias del writer

  if (isLoading) return <div className='link-return-writers'>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="writer-bio-container">
        <p className="featured-quote">{writer.bioQuote} </p>
        <p className='writer-sub-quote'>{writer.firstName} {writer.lastName} * § * {writer.titleBookQuote} </p>
        <hr className="writer-bio-line" />
        <div className="writer-bio-wrapper">
          <div className="writer-details-bio-books">
            <div className='writer-bio-name-last-name'>
              <p>{writer.firstName} </p>
              <p>{writer.lastName}</p>
            </div>
            <div className='writer-books-titles'>
              <p>Libros disponibles</p>
              {books.length > 0 ? (
                <ul>
                  {books.map(book => (
                    <li key={book._id}>
                      <button
                        className='writer-titles-btn'
                        onClick={() => handleOpen(book)}
                      >
                        {book.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-books-message">No hay libros disponibles de este autor</p>
              )}
            </div>
          </div>
          <div className='writer-bio-description'>
            <p >{writer.bioDescription}
            </p>
          </div>

        </div>

      </div>

      <div>
        {isOpen && selectedBook && (
          <BookDetailModal
            book={selectedBook}
            isInCart={isInCart(selectedBook._id)}
            onAddToCart={() => addToCart(selectedBook)}
            isOpen={isOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>

    </div>
  )
}
