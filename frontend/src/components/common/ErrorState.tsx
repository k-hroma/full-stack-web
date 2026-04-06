/**
 * ErrorState - Estado de error reutilizable para secciones y páginas
 * @module components/common/ErrorState
 *
 * Diferencia con ErrorFallback:
 * - ErrorFallback → captura errores de React (ErrorBoundary), pantalla completa,
 *   estilos inline para funcionar sin CSS bundle.
 * - ErrorState → errores de fetch/API dentro de secciones, composable,
 *   usa las variables CSS del sistema de diseño.
 *
 * Uso:
 *   if (error) return <ErrorState message={error} onRetry={loadData} />;
 */

interface ErrorStateProps {
  /** Mensaje de error a mostrar. Si se omite muestra un texto genérico. */
  message?: string | null;
  /** Callback opcional para reintentar. Si se pasa, aparece el botón "Reintentar". */
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert" aria-live="polite">
      <p className="error-state__icon" aria-hidden="true">✕</p>
      <p className="error-state__message">
        {message ?? 'Ocurrió un error al cargar el contenido.'}
      </p>
      {onRetry && (
        <button
          className="error-state__retry"
          onClick={onRetry}
          type="button"
        >
          Reintentar
        </button>
      )}

      <style>{`
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 3rem 1.5rem;
          text-align: center;
          width: 100%;
        }
        .error-state__icon {
          font-size: 2rem;
          color: var(--brown, #954300);
          font-style: normal;
          line-height: 1;
        }
        .error-state__message {
          font-family: var(--font-sans, 'Neue Montreal', sans-serif);
          font-size: 0.9375rem;
          color: var(--light-brown, #C3762A);
          max-width: 380px;
          line-height: 1.6;
        }
        .error-state__retry {
          margin-top: 0.25rem;
          padding: 0.625rem 1.75rem;
          border-radius: 50px;
          border: 1.5px solid var(--brown, #954300);
          background: transparent;
          color: var(--brown, #954300);
          font-family: var(--font-sans, 'Neue Montreal', sans-serif);
          font-weight: 500;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .error-state__retry:hover {
          background: var(--brown, #954300);
          color: var(--beige, #E2E2E2);
        }
      `}</style>
    </div>
  );
}
