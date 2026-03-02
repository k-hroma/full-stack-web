import { useSearch } from '../../hooks/useSearch';

export default function ResultadosPage() {
  const { results, searchTerm } = useSearch();

  return (
    <div>
      <h1>Resultados para "{searchTerm}"</h1>
      
      {results.length === 0 ? (
        <p>No se encontraron libros</p>
      ) : (
        <ul>
          {results.map((book) => (
            <li key={book._id}>
              <strong>{book.title}</strong> - {book.firstName} {book.lastName}
              <br />
              ${book.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}