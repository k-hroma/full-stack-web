import { useEffect, useState } from "react";
import { getWriters } from "../../api/writers";
import type { Writer } from "../../types/writer";
import '../../styles/pages/public/writers.css'
import { Link } from "react-router-dom";

export default function Writers() {
  const [writers, setWriters] = useState<Writer[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWriters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getWriters({ recomended: true });
        // Primero filtrar duplicados por nombre y apellido (ignorando mayúsculas)
        const uniqueWriters = data.filter((writer, index, self) =>
          index === self.findIndex((b) =>
            b.lastName.toLowerCase() === writer.lastName.toLowerCase() &&
            b.firstName.toLowerCase() === writer.firstName.toLowerCase()
          )
        );

        // Luego ordenar por apellido
        uniqueWriters.sort((a, b) => a.lastName.localeCompare(b.lastName));

        // Mostrar solo los primeros 9 escritores recomendados  
        const nineWriters = uniqueWriters.slice(0, 9);

        setWriters(nineWriters);
      } catch (error) {
        const errMsg = error instanceof Error
          ? error.message
          : 'Error al cargar los escritorxs';
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    }
    loadWriters();
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
          <Link to='/escritorxs' className="link-return">Ver más →</Link>
        </div>
        <div className="txt-writers-container">
          {writers && writers.map(writer => (
            <div key={`${writer.lastName}-${writer.firstName}`}>
              <Link
                to={`/writers/${writer._id}`}
                className="writers-txt-wrapper"
              >
                <div className="writers-arrow" >
                  <p className="txt-writers-container-authors">
                    {writer.lastName} {writer.firstName}
                  </p>
                  <p className="txt-gender-container">→</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}