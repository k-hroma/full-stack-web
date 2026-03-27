import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWriters } from "../../api/writers";
import type { Writer } from "../../types/writer";
import '../../styles/pages/public/writers.css'

export default function AllWriters() {
  const [writers, setWriters] = useState<Writer[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Abecedario completo incluyendo Ñ para nombres en español
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  useEffect(() => {
    const loadWriters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getWriters();
        // Primero filtrar duplicados por nombre y apellido (ignorando mayúsculas)
        const uniqueWriters = data.filter((writer, index, self) =>
          index === self.findIndex((b) =>
            b.lastName.toLowerCase() === writer.lastName.toLowerCase() &&
            b.firstName.toLowerCase() === writer.firstName.toLowerCase()
          )
        );

        // Luego ordenar por apellido
        uniqueWriters.sort((a, b) => a.lastName.localeCompare(b.lastName));

        setWriters(uniqueWriters);
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

  // Función opcional para hacer scroll a la primera letra disponible
  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) return <div className='link-return-writers'>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className="writers-section">
      <div className="writers-container">
        <div className="txt-writers-title-container">
          <p className="txt-writers">
            Escritorxs
          </p>
          <Link className="link-return-writers" to='/'>Volver</Link>
        </div>

        <div className="txt-writers-container">
          {writers && writers.map((writer, index) => {
            const currentLetter = writer.lastName.charAt(0).toUpperCase();
            const prevLetter = index > 0 ? writers[index - 1].lastName.charAt(0).toUpperCase() : null;
            const showLetterHeader = currentLetter !== prevLetter;

            return (
              <div key={`${writer.lastName}-${writer.firstName}`}>
                {showLetterHeader && (
                  <div id={`letter-${currentLetter}`} className="letter-section-header">
                    {currentLetter}
                  </div>
                )}
                <Link
                  className="writers-txt-wrapper"
                  to={`/writers/${writer._id}`}
                >
                  <div className="writers-txt-wrapper" >
                    <p className="txt-writers-container-authors">
                      {writer.lastName} {writer.firstName} <span className="txt-gender-container">→</span>
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Abecedario flotante */}
      <nav className="alphabet-nav">
        {alphabet.map((letter) => (
          <button
            key={letter}
            className="alphabet-letter"
            onClick={() => scrollToLetter(letter)}
            aria-label={`Ir a letra ${letter}`}
          >
            {letter}
          </button>
        ))}
      </nav>
    </section>
  )
}