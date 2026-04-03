import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWriterById } from "../../api/writers";
import type { Writer } from "../../types/writer";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import Writers from "../../pages/public/Writers"
import WriterBioCard from "../../components/writerCard/WriterBioCard";


export default function WriterBioPage() {

  const [writer, setWriter] = useState<Writer>()
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams();

  useEffect(() => {

    if (!id) {
      setError('ID no proporcionado');
      setIsLoading(false);
      return;
    }

    const loadWriter = async () => {

      setIsLoading(true);
      setError(null);
      try {
        const data = await getWriterById(id);

        if (!data) {
          throw new Error('Escritor no encontrado');
        }
        setWriter(data);

      } catch (error) {
        const errMsg = error instanceof Error
          ? error.message
          : 'Error al cargar los libros';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadWriter();
  }, [id]);

  if (isLoading) return <div className='page-loading-container'>
    <LoadingSpinner fullScreen={false} text="Cargando" />
  </div>;
  if (error) return <div>{error}</div>;
  if (!writer) return <div>No se encontró el Esrcitorx</div>;


  return (
    <section className="writer-bio-section">
      <WriterBioCard
        writer={writer}
      />
      <Writers />
    </section>
  )
}
