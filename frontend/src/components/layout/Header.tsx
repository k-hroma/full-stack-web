/**
 * Header - Navegación principal con carrito y auth
 * @module components/layout/Header
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      {/* Logo / Marca */}
      <Link to="/" className="header__logo">
        La Palacio
      </Link>

      {/* Navegación principal */}
      <nav className="header__nav">
        <Link to="/" className="header__link">Inicio</Link>
        <Link to="/catalog" className="header__link">Catálogo</Link>
        <Link to="/catalog?latestBook=true" className="header__link">Novedades</Link>
        <Link to="/catalog?fanzine=true" className="header__link">Fanzines</Link>
      </nav>

      {/* Acciones de usuario */}
      <div className="header__actions">
        {/* Carrito - siempre visible */}
        <Link to="/cart" className="header__cart">
          <span className="header__cart-icon">🛒</span>
          {itemCount > 0 && (
            <span className="header__cart-badge">{itemCount}</span>
          )}
        </Link>

        {/* Auth */}
        {isAuthenticated ? (
          <div className="header__user">
            <span className="header__user-name">{user?.name}</span>
            {isAdmin && (
              <Link to="/admin" className="header__admin-link">
                Panel Admin
              </Link>
            )}
            <button onClick={handleLogout} className="header__logout">
              Salir
            </button>
          </div>
        ) : (
          <Link to="/login" className="header__login">
            Ingresar
          </Link>
        )}
      </div>
    </header>
  );
}