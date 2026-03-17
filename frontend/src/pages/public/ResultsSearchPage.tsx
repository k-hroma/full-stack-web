import { useSearch } from '../../hooks/useSearch';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { BookCard } from '../../components/bookCard/BookCard'
import { Search } from '@boxicons/react';
import '../../styles/pages/public/grid-books.css'

export default function ResultadosPage() {
  const { results, searchTerm } = useSearch();
  const { addToCart, isInCart } = useCart();



  return (
    <section className='books-container'>
      <div className="txt-section-container">

        <h2 className="resultados-title"><Search fill="#954300" /> Resultados de búsqueda </h2>
        <Link className="link-return" to='/'>Volver</Link>
      </div>
      <div className='grid-container'>
        {results.length === 0
          ? (<p className='link-return'>No se encontraron resultados para "{searchTerm}"</p>)
          : (
            results.map((book, index) => (
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