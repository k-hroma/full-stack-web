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
        const filters = {
          ...(isFanzine && { fanzine: true }),
          ...(isLatest && { latestBook: true }),
        };
        
        const data = await getBooks(filters);
        setBooks(data);
      } catch (err) {
        console.log(err);
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

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>{getTitle()}</h1>
      
      {books.length === 0 ? (
        <p>No hay libros disponibles.</p>
      ) : (
        <div>
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
    <article>
      <Link to={`/book/${book._id}`}>
        <img 
          src={book.img} 
          alt={book.title}
          loading="lazy"
        />
        <div>
          <h3>{book.title}</h3>
          <p>
            {book.firstName} {book.lastName}
          </p>
          <p>{book.editorial}</p>
          <p>${book.price}</p>
          {book.stock === 0 && (
            <span>Sin stock</span>
          )}
        </div>
      </Link>
      
      <button
        onClick={onAddToCart}
        disabled={isInCart || book.stock === 0}
      >
        {isInCart ? 'En carrito' : book.stock === 0 ? 'Sin stock' : 'Agregar'}
      </button>
    </article>
  );
}