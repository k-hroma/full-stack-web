// Header.tsx
import { useState, useRef, useEffect } from 'react'; // Agregar useRef y useEffect
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { CartSidebar } from '../cart/CartSidebar';
import { AnimatedNav } from '../navbar/AnimatedNav';
import { HamburguerMenu } from '../navbar/HamburguerMenu';
import { SearchBooks } from '../search/Search';
import lpicon from '../../assets/img/optimized/lapalacio-logo.svg';
import usericon from '../../assets/img/optimized/user-loguin-logo.webp';
import lineicon from '../../assets/icons/line-nav-search.svg';
import { Cart, Search as SearchIcon, X, Menu } from '@boxicons/react';
import '../../styles/layout/header.css';

export function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isConfirmLogout, setIsConfirmLogout] = useState(false);

  // Referencia al contenedor del usuario para detectar clics fuera
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleLogout = async () => {
    await logout();
    setIsConfirmLogout(false); // Cerrar el dropdown
    navigate('/');
  };

  const confirmLogout = () => {
    setIsConfirmLogout(true);
  };

  const cancelLogout = () => {
    setIsConfirmLogout(false);
  };

  // Efecto para cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsConfirmLogout(false);
      }
    }

    if (isConfirmLogout) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isConfirmLogout]);

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
              <Menu fill='#954300' />
            </button>
          </div>

          {/* Centro: Logo */}
          <div className="header__section header__section--center">
            <Link
              to="/"
              className="header__logo-link"
              aria-label="Ir al inicio"
              onClick={handleClick}
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

            {/* Contenedor del Usuario con el Dropdown */}
            <div className="header__user-menu" ref={userMenuRef}>
              {/* Icono de Usuario - SIEMPRE VISIBLE */}
              {isAuthenticated ? (
                <button
                  className="header__icon-btn header__auth-icon"
                  onClick={confirmLogout}
                  aria-label="Opciones de usuario"
                >
                  <img src={usericon} alt="Usuario" width="25" height="25" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="header__icon-btn header__auth-icon"
                  aria-label="Iniciar sesión"
                >
                  <img src={usericon} alt="Usuario" width="25" height="25" />
                </Link>
              )}

              {/* ASIDE/DROPDOWN */}
              {isAuthenticated && isConfirmLogout && (
                <div className="header-logput-toast">
                  <div className="header__logout-actions">
                    <div className='action-btn-header-logout-confirm'>
                      <p className='header-logout-user-name'>{user?.name}</p>
                      <button
                        className="toast-user-close"
                        onClick={cancelLogout}
                        aria-label="Cerrar menú"
                      >
                        x
                      </button>
                    </div>
                    <p>{user?.email}</p>
                  </div>
                  {/* Solo para admins*/}
                  <div className='admin__header_links_wrapper'>
                    {isAuthenticated && isAdmin && (
                      <>
                        <Link
                          to="/admin" className='header__admin-links'
                          onClick={() => setIsConfirmLogout(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/admin/dashboard-books" className='header__admin-links'
                          onClick={() => setIsConfirmLogout(false)}

                        >
                          Gestión de libros
                        </Link>
                        <Link
                          to="/admin/dashboard-writers" className='header__admin-links'
                          onClick={() => setIsConfirmLogout(false)}

                        >
                          Gestión de Escritores
                        </Link>
                        <Link
                          to="/admin/register-admin" className='header__admin-links'
                          onClick={() => setIsConfirmLogout(false)}

                        >
                          Gestión de usuarios
                        </Link>
                      </>
                    )}
                  </div>
                  <button
                    className="header__logout-btn--confirm"
                    onClick={handleLogout}
                  >
                    Salir
                  </button>
                </div>
              )}
            </div>

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
            {!isAdmin && (<button
              onClick={() => setIsCartOpen(true)}
              className="header__icon-btn header__cart-btn"
              aria-label={`Carrito con ${itemCount} items`}
            >
              <Cart fill="#954300" />
              {itemCount > 0 && (
                <span className="header__cart-badge">{itemCount}</span>
              )}
            </button>)}

          </div>
        </div>
      </header >
      <HamburguerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        userName={user?.name}
      />
      {!isAdmin && (
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      )}

    </>
  );
}