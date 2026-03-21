import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBookById } from "../../api";
import type { Book } from "../../types";
import WriterBioCard from "../../components/writerCard/WriterBioCard";

export default function WriterBioPage() {
  const [book, setBook] = useState<Book>()
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams();

  useEffect(() => {
    console.log(id)
    if (!id) {
      setError('ID no proporcionado');
      setIsLoading(false);
      return;
    }

    const loadBooks = async () => {

      setIsLoading(true);
      setError(null);
      try {
        const data = await getBookById(id);
        console.log(data)
        if (!data) {
          throw new Error('Escritor no encontrado');
        }
        setBook(data);

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
  }, [id]);

  if (isLoading) return <div className='link-return-writers'>Cargando...</div>;
  if (error) return <div>{error}</div>;
  if (!book) return <div>No se encontró el libro</div>;


  return (
    <section className="writer-bio-section">
      <h1>Writer Card</h1>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, soluta ratione dolorem beatae non quam deserunt eos, voluptatem iure quia est a porro reiciendis sint nihil ab et, rem consequuntur!</p>
      <WriterBioCard
        book={book}
      />
    </section>
  )
}
