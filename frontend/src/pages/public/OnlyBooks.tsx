/**
 * Fanzines - Página de  de fanzines
 * Conecta con GET /books del backend
 * @module pages/public/OnlyBooks
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../../api';
import { useCart } from '../../hooks/useCart';
import { BookCard } from '../../components/bookCard/BookCard'
import type { Book } from '../../types/book';
import '../../styles/pages/public/grid-books.css'

export default function OnlyBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getBooks({fanzine: false });
        setBooks(data);
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

  if (isLoading) return <div className='link-return'>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className='books-container'>
      <div className="txt-section-container">
        <h2 className="section-title">Libros</h2>
        <Link className="link-return" to='/'>Volver</Link>
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
                />
              ))
          )}
      </div>
    </section>
  );
}


