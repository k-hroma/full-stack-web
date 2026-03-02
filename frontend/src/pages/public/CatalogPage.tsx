/**
 * CatalogPage - Página de catálogo de libros
 * Conecta con GET /books del backend
 * @module pages/public/CatalogPage
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBooks } from '../../api';
import { useCart } from '../../hooks/useCart';
import type { Book } from '../../types';
import '../../styles/pages/public/catalog.css'

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const { addToCart, isInCart } = useCart();

  // Leer filtros de URL
  const isFanzine = searchParams.get('fanzine') === 'true';
  const isLatest = searchParams.get('latestBook') === 'true';

  // Cargar libros al montar o cambiar filtros
  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // ACÁ SE CONECTA CON TU BACKEND:
        // GET /books?fanzine=true o GET /books?latestBook=true o GET /books
        const filters = {
          ...(isFanzine && { fanzine: true }),
          ...(isLatest && { latestBook: true }),
        };
        
        const data = await getBooks(filters);
        setBooks(data);
      } catch (err) {
        console.log(err)
        setError('Error al cargar los libros');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [isFanzine, isLatest]);

  // Título según filtro
  const getTitle = () => {
    if (isFanzine) return 'Fanzines';
    if (isLatest) return 'Novedades';
    return 'Catálogo';
  };

  if (isLoading) return <div className="catalog-page__loading">Cargando...</div>;
  if (error) return <div className="catalog-page__error">{error}</div>;

  return (
    <div className="catalog-page">
      <h1 className="catalog-page__title">{getTitle()}</h1>
      
      {books.length === 0 ? (
        <p className="catalog-page__empty">No hay libros disponibles.</p>
      ) : (
        <div className="catalog-page__grid">
          {books.map(book => (
            <BookCard 
              key={book._id} 
              book={book} 
              isInCart={isInCart(book._id)}
              onAddToCart={() => addToCart(book)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente interno: Tarjeta de libro
interface BookCardProps {
  book: Book;
  isInCart: boolean;
  onAddToCart: () => void;
}

function BookCard({ book, isInCart, onAddToCart }: BookCardProps) {
  return (
    <article className="book-card">
      <Link to={`/book/${book._id}`} className="book-card__link">
        <img 
          src={book.img} 
          alt={book.title} 
          className="book-card__image"
          loading="lazy"
        />
        <div className="book-card__info">
          <h3 className="book-card__title">{book.title}</h3>
          <p className="book-card__author">
            {book.firstName} {book.lastName}
          </p>
          <p className="book-card__editorial">{book.editorial}</p>
          <p className="book-card__price">${book.price}</p>
          {book.stock === 0 && (
            <span className="book-card__out-of-stock">Sin stock</span>
          )}
        </div>
      </Link>
      
      <button
        onClick={onAddToCart}
        disabled={isInCart || book.stock === 0}
        className={`book-card__button ${isInCart ? 'book-card__button--in-cart' : ''}`}
      >
        {isInCart ? 'En carrito' : book.stock === 0 ? 'Sin stock' : 'Agregar'}
      </button>
    </article>
  );
}