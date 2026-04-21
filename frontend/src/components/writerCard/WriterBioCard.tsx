/**
 * WriterBioCard - Tarjeta de biografía del escritorx con libros disponibles
 * @module components/writerCard/WriterBioCard
 *
 */

import { useEffect, useState } from 'react';
import type { Writer } from '../../types/writer';
import type { Book } from '../../types';
import { getBooksByAuthor } from '../../api';
import { useModal } from '../../hooks/useModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import '../../styles/pages/public/writer-bio-card.css';

interface WriterBioCardProps {
  writer: Writer;
}

export default function WriterBioCard({ writer }: WriterBioCardProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useModal abre el modal global que vive en ModalProvider.
  // Elimina la necesidad de useState(isOpen), useState(selectedBook) y useCart.
  const { openModal } = useModal();

  useEffect(() => {
    if (!writer.lastName || !writer.firstName) return;

    let cancelled = false;

    const loadBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getBooksByAuthor(writer.lastName, writer.firstName);
        if (!cancelled) setBooks(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar los libros');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadBooks();
    return () => { cancelled = true; };
  }, [writer.lastName, writer.firstName]);

  if (isLoading) return (
    <div className="page-loading-container">
      <LoadingSpinner fullScreen={false} text="Cargando" />
    </div>
  );

  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="writer-bio-container">
        <p className="featured-quote">{writer.bioQuote}</p>
        <p className="writer-sub-quote">
          {writer.firstName} {writer.lastName} * § * {writer.titleBookQuote}
        </p>
        <hr className="writer-bio-line" />

        <div className="writer-bio-wrapper">
          <div className="writer-details-bio-books">
            <div className="writer-bio-name-last-name">
              <p>{writer.firstName}</p>
              <p>{writer.lastName}</p>
            </div>

            <div className="writer-books-titles">
              <p>Libros disponibles</p>
              {books.length > 0 ? (
                <ul>
                  {books.map((book, index) => (
                    <li key={book._id}>
                      <button
                        className="writer-titles-btn"
                        onClick={() => openModal(book, index)}
                        aria-label={`Ver detalles de ${book.title}`}
                      >
                        {book.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-books-message">
                  No hay libros disponibles de este autor
                </p>
              )}
            </div>
          </div>

          <div className="writer-bio-description">
            <p>{writer.bioDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
