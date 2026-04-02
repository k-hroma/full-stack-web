// Header.tsx
import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { CartSidebar } from '../cart/CartSidebar';
import { AnimatedNav } from '../navbar/AnimatedNav';
import { HamburguerMenu } from '../navbar/HamburguerMenu';
import { SearchBooks } from '../search/Search';
import lpicon from '../../assets/img/optimized/lapalacio-logo.svg';
import lineicon from '../../assets/icons/line-nav-search.svg';
import { Cart, Search as SearchIcon, X, Menu, Alien } from '@boxicons/react';
import '../../styles/layout/header.css';

// ─── CartButton: se re-renderiza SOLO cuando cambia itemCount o isAdmin ───────
interface CartButtonProps {
  itemCount: number;
  isAdmin: boolean;
  onClick: () => void;
}

const CartButton = memo(function CartButton({ itemCount, isAdmin, onClick }: CartButtonProps) {
  if (isAdmin) return null;
  return (
    <button
      onClick={onClick}
      className="header__icon-btn header__cart-btn"
      aria-label={`Carrito con ${itemCount} items`}
    >
      <Cart fill="#954300" />
      {itemCount > 0 && (
        <span className="header__cart-badge">{itemCount}</span>
      )}
    </button>
  );
});

// ─── UserMenu: aislado para no re-renderizar el header completo ───────────────
interface UserMenuProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userName?: string;
  userEmail?: string;
  isConfirmLogout: boolean;
  onConfirmLogout: () => void;
  onCancelLogout: () => void;
  onLogout: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

const UserMenu = memo(function UserMenu({
  isAuthenticated,
  isAdmin,
  userName,
  userEmail,
  isConfirmLogout,
  onConfirmLogout,
  onCancelLogout,
  onLogout,
  menuRef,
}: UserMenuProps) {
  return (
    <div className="header__user-menu" ref={menuRef}>
      {isAuthenticated ? (
        <button
          className="header__icon-btn header__auth-icon"
          onClick={onConfirmLogout}
          aria-label="Opciones de usuario"
        >
          <Alien fill="#954300" />
        </button>
      ) : (
        <Link
          to="/login"
          className="header__icon-btn header__auth-icon"
          aria-label="Iniciar sesión"
        >
          <Alien fill="#954300" />
        </Link>
      )}

      {isAuthenticated && isConfirmLogout && (
        <div className="header-logput-toast">
          <div className="header__logout-actions">
            <div className='action-btn-header-logout-confirm'>
              <p className='header-logout-user-name'>{userName}</p>
              <button
                className="toast-user-close"
                onClick={onCancelLogout}
                aria-label="Cerrar menú"
              >
                x
              </button>
            </div>
            <p>{userEmail}</p>
          </div>

          <div className='admin__header_links_wrapper'>
            {isAdmin && (
              <>
                <Link to="/admin" className='header__admin-links' onClick={onCancelLogout}>
                  Dashboard
                </Link>
                <Link to="/admin/dashboard-books" className='header__admin-links' onClick={onCancelLogout}>
                  Gestión de libros
                </Link>
                <Link to="/admin/dashboard-writers" className='header__admin-links' onClick={onCancelLogout}>
                  Gestión de Escritores
                </Link>
                <Link to="/admin/register-admin" className='header__admin-links' onClick={onCancelLogout}>
                  Gestión de usuarios
                </Link>
              </>
            )}
          </div>

          <button className="header__logout-btn--confirm" onClick={onLogout}>
            Salir
          </button>
        </div>
      )}
    </div>
  );
});

// ─── Header principal ─────────────────────────────────────────────────────────
export function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isConfirmLogout, setIsConfirmLogout] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setIsConfirmLogout(false);
    navigate('/');
  }, [logout, navigate]);

  const confirmLogout = useCallback(() => setIsConfirmLogout(true), []);
  const cancelLogout = useCallback(() => setIsConfirmLogout(false), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleSearch = useCallback(() => setIsSearchExpanded(prev => !prev), []);

  useEffect(() => {
    if (!isConfirmLogout) return;

    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsConfirmLogout(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isConfirmLogout]);

  return (
    <>
      <header className="header">
        {/* AnimatedNav es memo → nunca se re-renderiza */}
        <AnimatedNav />

        <div className="header__container">
          {/* Izquierda */}
          <div className="header__section header__section--left">
            <button
              className="header__icon-btn"
              onClick={openMenu}
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
                <img src={lpicon} alt="La Palacio" width="51" height="56" />
              </span>
            </Link>
          </div>

          {/* Derecha */}
          <div className="header__section header__section--right">
            {/* UserMenu aislado → el resto del header no se re-renderiza al abrir dropdown */}
            <UserMenu
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              userName={user?.name}
              userEmail={user?.email}
              isConfirmLogout={isConfirmLogout}
              onConfirmLogout={confirmLogout}
              onCancelLogout={cancelLogout}
              onLogout={handleLogout}
              menuRef={userMenuRef}
            />

            <img
              className="header__divider"
              src={lineicon}
              alt=""
              height="25"
              aria-hidden="true"
            />

            <div className={`header__search-wrapper ${isSearchExpanded ? 'is-expanded' : ''}`}>
              <div className="header__search-desktop">
                <SearchBooks />
              </div>

              <button
                className="header__icon-btn header__search-toggle"
                onClick={toggleSearch}
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

            {/* CartButton aislado → solo se re-renderiza cuando cambia itemCount */}
            <CartButton
              itemCount={itemCount}
              isAdmin={isAdmin}
              onClick={openCart}
            />
          </div>
        </div>
      </header>

      <HamburguerMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        userName={user?.name}
      />

      {!isAdmin && (
        <CartSidebar
          isOpen={isCartOpen}
          onClose={closeCart}
        />
      )}
    </>
  );
}
