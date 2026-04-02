// src/components/error/ErrorFallback.tsx

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div style={styles.wrapper} role="alert">
      <span style={styles.icon}>⚠️</span>
      <h2 style={styles.title}>Algo salió mal</h2>
      <p style={styles.message}>
        {error?.message || 'Ocurrió un error inesperado.'}
      </p>

      <div style={styles.actions}>
        <button
          style={styles.btnPrimary}
          onClick={() => window.location.reload()}
        >
          Recargar página
        </button>

        {onRetry && (
          <button
            style={styles.btnSecondary}
            onClick={onRetry}
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

/* Estilos en línea para que funcionen independiente del CSS bundle */
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    background: 'var(--beige, #E2E2E2)',
    gap: '1.25rem',
    textAlign: 'center',
    fontFamily: "'Neue Montreal Regular', sans-serif",
  },
  icon: {
    fontSize: '3rem',
    lineHeight: 1,
  },
  title: {
    fontFamily: "'PPEditorialNew', serif",
    fontSize: '2rem',
    fontWeight: 200,
    color: 'var(--brown, #954300)',
    letterSpacing: '-0.02em',
  },
  message: {
    fontSize: '0.9375rem',
    color: 'var(--light-brown, #C3762A)',
    maxWidth: '420px',
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
  btnPrimary: {
    padding: '0.875rem 2rem',
    borderRadius: '50px',
    border: '1.5px solid var(--brown, #954300)',
    background: 'var(--brown, #954300)',
    color: 'var(--beige, #E2E2E2)',
    fontFamily: "'Neue Montreal Medium', sans-serif",
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '0.875rem 2rem',
    borderRadius: '50px',
    border: '1.5px solid var(--brown, #954300)',
    background: 'transparent',
    color: 'var(--brown, #954300)',
    fontFamily: "'Neue Montreal Medium', sans-serif",
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    cursor: 'pointer',
  },
};
