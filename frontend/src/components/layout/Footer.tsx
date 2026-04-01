/**
 * Footer - Pie de página
 * @module components/layout/Footer
*/

import { Link } from 'react-router-dom';
import { ExternalLink } from '../common/ExternalLink';
import '../../styles/layout/footer.css'
import bgFooter from '../../assets/img/optimized/bg-footer.png'

export function Footer() {
  return (
    <footer
      className="footer-container"
      style={{ '--bg-footer-url': `url(${bgFooter})` } as React.CSSProperties}
    >
      <div className="bg-footer" />

      <div className="footer-content">
        {/* Columna izquierda - Links internos */}
        <nav className="left-content" aria-label="Navegación principal">
          <Link to="/catalogo" className="footer-main-txt">Impresos:</Link>
          <Link to="/novedades" className="footer-main-txt">Novedades</Link>
          <Link to="/libros" className="footer-main-txt">Libros</Link>
          <Link to="/fanzines" className="footer-main-txt">Fanzines</Link>
        </nav>

        {/* Columna derecha - Links internos */}
        <nav className="right-content" aria-label="Navegación secundaria">
          <Link to="/escritorxs" className="footer-main-txt">Escritorxs</Link>
          <Link to="/nosotrxs" className="footer-main-txt">Nosotrxs</Link>
          <Link to="/contacto" className="footer-main-txt">Contacto</Link>
          <span className="footer-main-txt">-</span>
          <span className="cr-text">@lapalaciolibros</span>
        </nav>

        {/* Copyright */}
        <div className="copy-texts">
          <p className="cr-text">
            @lapalaciolibros. Copyright - All rights reserved
          </p>
        </div>

        {/* Khroma - primer crédito */}
        <div className="khroma-container">
          <ExternalLink
            href="https://k-hroma.github.io/Portfolio/pages/index.html"
            className="small-credits link-kroma"
          >
            desarrollo web: k-roma
          </ExternalLink>
        </div>

        {/* Rofuks - segundo crédito */}
        <div className="rofuks-container">
          <ExternalLink
            href="https://www.behance.net/rociofuks"
            className="small-credits"
          >
            diseño web: rofuks
          </ExternalLink>
        </div>
      </div>
    </footer>
  );
}