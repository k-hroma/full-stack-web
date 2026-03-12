import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "../../api";
import type { Book } from "../../types";
import '../../styles/pages/public/writers.css'

export default function Writers() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getBooks({ recomendedWriter: true });

        // Primero filtrar duplicados, luego ordenar (más eficiente y predecible)
        const uniqueBooks = data.filter((book, index, self) =>
          index === self.findIndex((b) =>
            b.lastName.toLowerCase() === book.lastName.toLowerCase() &&
            b.firstName.toLowerCase() === book.firstName.toLowerCase()
          )
        );

        // Luego ordenar por apellido
        uniqueBooks.sort((a, b) => a.lastName.localeCompare(b.lastName));

        // Mostrar solo los primeros 9 escritores recomendados  
        const nineWriters = uniqueBooks.slice(0, 9);

        setBooks(nineWriters);
      } catch (error) {
        const errMsg = error instanceof Error
          ? error.message
          : 'Error al cargar los libros';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    }
    loadBooks();
  }, []);

  if (isLoading) return <div className='link-return-writers'>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className="writers-section">
      <div className="writers-container">
        <div className="txt-writers-title-container">
          <p className="txt-writers">
            Escritores recomendados
          </p>
          <Link className="link-return-writers" to='/'>Volver</Link>
        </div>
        <div className="txt-writers-container">
          {books && books.map(book => (

            <div key={`${book.lastName}-${book.firstName}`}>
              <p className="txt-writers-container-authors">
                {book.lastName} {book.firstName} <span className="txt-gender-container">{book.editorial}</span>
              </p>
              <p className="txt-g-c-small">{book.editorial}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}