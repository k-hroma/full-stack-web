/**
 * Footer - Pie de página
 * @module components/layout/Footer
 */

export function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} La Palacio. Todos los derechos reservados.</p>
    </footer>
  );
}