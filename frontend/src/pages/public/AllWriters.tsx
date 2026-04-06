/**
 * AllWriters - Listado completo de escritorxs ordenados alfabéticamente
 * @module pages/public/AllWriters
 */

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWriters } from '../../api/writers';
import type { Writer } from '../../types/writer';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import '../../styles/pages/public/writers.css';

/**
 * Abecedario completo incluyendo Ñ para nombres en español.
 *
 * FUERA del componente: es una constante estática que nunca cambia.
 * Dentro del componente se recrearía como array nuevo en cada render,
 * lo que forzaría al browser a re-diffear 27 botones sin ningún motivo.
 */
const ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

/** Deduplica escritorxs por apellido+nombre (case-insensitive) y ordena por apellido. */
function normalizeWriters(data: Writer[]): Writer[] {
  const unique = data.filter((writer, index, self) =>
    index === self.findIndex(
      (w) =>
        w.lastName.toLowerCase() === writer.lastName.toLowerCase() &&
        w.firstName.toLowerCase() === writer.firstName.toLowerCase(),
    ),
  );
  return unique.sort((a, b) => a.lastName.localeCompare(b.lastName, 'es'));
}

export default function AllWriters() {
  const [writers, setWriters] = useState<Writer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWriters = useCallback(async () => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    try {
      const data = await getWriters();
      if (!cancelled) setWriters(normalizeWriters(data));
    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Error al cargar los escritorxs');
      }
    } finally {
      if (!cancelled) setIsLoading(false);
    }

    // Cleanup: si el efecto se re-ejecuta o el componente se desmonta
    // antes de que termine el fetch, descartamos el resultado.
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    loadWriters();
  }, [loadWriters]);

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) return (
    <div className="page-loading-container">
      <LoadingSpinner fullScreen={false} text="Cargando" />
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={loadWriters} />;

  return (
    <section className="writers-section">
      <div className="writers-container">
        <div className="txt-writers-title-container">
          <p className="txt-writers">Escritorxs</p>
          <Link className="link-return" to="/">Volver</Link>
        </div>

        <div className="txt-writers-container">
          {writers.map((writer, index) => {
            const currentLetter = writer.lastName.charAt(0).toUpperCase();
            const prevLetter = index > 0
              ? writers[index - 1].lastName.charAt(0).toUpperCase()
              : null;
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
                  <p className="txt-writers-container-authors">
                    {writer.lastName} {writer.firstName}{' '}
                    <span className="txt-gender-container">→</span>
                  </p>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Abecedario flotante */}
      <nav className="alphabet-nav" aria-label="Navegar por letra">
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            className="alphabet-letter"
            onClick={() => scrollToLetter(letter)}
            aria-label={`Ir a letra ${letter}`}
            type="button"
          >
            {letter}
          </button>
        ))}
      </nav>
    </section>
  );
}
