// Header.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { CartSidebar } from '../cart/CartSidebar';
import { AnimatedNav } from '../navbar/AnimatedNav';
import { HamburguerMenu } from '../navbar/HamburguerMenu';
import HamburguerIcon from '../../assets/icons/hamburguer-menu-icon.svg';
import { SearchBooks } from '../search/Search';
import lpicon from '../../assets/icons/lapalacio-logo.svg';
import usericon from '../../assets/icons/loguin-user.svg';
import lineicon from '../../assets/icons/line-nav-search.svg';
import { Cart, Search as SearchIcon, X } from '@boxicons/react';
import '../../styles/layout/header.css';

export function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className="header">
        <AnimatedNav />

        <div className="header__container">
          {/* Izquierda: Menú Hamburguesa */}
          <div className="header__section header__section--left">
            <button
              className="header__icon-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <img
                src={HamburguerIcon}
                alt="Menú"
                width="22"
                height="15"
              />
            </button>
          </div>

          {/* Centro: Logo */}
          <div className="header__section header__section--center">
            <Link
              to="/"
              className="header__logo-link"
              aria-label="Ir al inicio"
            >
              <span className="header__logo-hit-area">
                <img
                  src={lpicon}
                  alt="La Palacio"
                  width="51"
                  height="56"
                />
              </span>
            </Link>
          </div>

          {/* Derecha: Icono User (siempre visible), Admin (si aplica), Search y Cart */}
          <div className="header__section header__section--right">
            {/* Icono de Usuario - SIEMPRE VISIBLE */}
            <Link
              to="/login"
              className="header__icon-btn header__auth-icon"
              aria-label="Iniciar sesión"
            >
              <img src={usericon} alt="Usuario" width="25" height="25" />
            </Link>

            {/* Panel Admin - Solo para admins (sin nombre de usuario) */}
            {isAuthenticated && isAdmin && (
              <Link to="/admin" className="header__admin-btn">
                Panel Admin
              </Link>
            )}

            {/* Línea divisoria */}
            <img
              className="header__divider"
              src={lineicon}
              alt=""
              height="25"
              aria-hidden="true"
            />

            {/* Search: Versión desktop siempre visible, móvil colapsable */}
            <div className={`header__search-wrapper ${isSearchExpanded ? 'is-expanded' : ''}`}>
              <div className="header__search-desktop">
                <SearchBooks />
              </div>

              <button
                className="header__icon-btn header__search-toggle"
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                aria-label={isSearchExpanded ? "Cerrar búsqueda" : "Abrir búsqueda"}
              >
                {isSearchExpanded ? <X fill="#954300" /> : <SearchIcon fill="#954300" />}
              </button>

              {isSearchExpanded && (
                <div className="header__search-mobile">
                  <SearchBooks />
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="header__icon-btn header__cart-btn"
              aria-label={`Carrito con ${itemCount} items`}
            >
              <Cart fill="#954300" />
              {itemCount > 0 && (
                <span className="header__cart-badge">{itemCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <HamburguerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        userName={user?.name}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}