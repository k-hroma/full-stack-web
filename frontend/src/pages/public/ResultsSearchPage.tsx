import { useSearch } from '../../hooks/useSearch';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { BookCard } from '../../components/bookCard/BookCard'
import type { Book } from '../../types/book';
import { BookDetailModal } from '../../components/bookDetailModal/BookDetailModal';
import { useWriterSearch } from '../../hooks/useWriterSearch';
import '../../styles/pages/public/results-search-page.css'


export default function ResultadosPage() {
  const { results, searchTerm } = useSearch();
  const { writerResults } = useWriterSearch();
  const { addToCart, isInCart } = useCart();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewMore = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };


  return (
    <section className='results-search-container'>
      <div className="txt-section-container">
        <p className="section-title">
          Resultados
        </p>
        <Link className="link-return" to='/'>Volver</Link>
      </div>
      {writerResults.length > 0 && (
        <div className="writers-results-search-container">
          <div className="txt-writers-container">
            {writerResults.map(writer => (
              <div key={writer._id}>
                <Link
                  to={`/writers/${writer._id}`}
                  className="writers-txt-wrapper"
                >
                  <div className="writers-txt-wrapper" >
                    <p className="txt-writers-container-authors">
                      {writer.lastName} {writer.firstName} <span className="txt-gender-container">→</span>
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      {results.length > 0 && (
        <div className='grid-results-search-container'>
          {results.length === 0 && writerResults.length === 0
            ? (<p className='link-return'>No se encontraron resultados para "{searchTerm}"</p>)
            : (
              results.map((book, index) => (
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
        </div>)}
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