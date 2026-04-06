// HamburguerMenu.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { X } from '@boxicons/react';
import '../../styles/layout/navbar/hamburguer-menu.css';

interface HamburguerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  userName?: string;
}

const HamburguerMenu = ({
  isOpen,
  onClose,
  isAuthenticated = false,
  onLogout,
}: HamburguerMenuProps) => {

  const { isAdmin } = useAuth();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div
      className="hamburguer-menu__overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
    >
      <aside
        className="hamburguer-menu"
        onClick={e => e.stopPropagation()}
      >
        <div className='hamburguer-menu__container'>
          {/* Header con nombre de usuario y cerrar */}
          <div className="hamburguer-menu__header">
            <button
              className='hamburguer-menu__close'
              type='button'
              onClick={onClose}
              aria-label="Cerrar menú"
            >
              <X
                fill='#FF76DC'
                size='md' />
            </button>

          </div>

          {/* Links de navegación */}
          <nav className="hamburguer-menu__nav">
            {/* Home - Nuevo link */}

            <Link className='hamburguer-menu__link' to='/' onClick={onClose}>
              Home
            </Link>
            {isAdmin &&
              <div className='hamburguer-menu__submenu'>
                <Link
                  className='hamburguer-menu__sublink'
                  to='/admin'
                  onClick={onClose}
                >
                  Dashboard
                </Link>

              </div>
            }

            <Link className='hamburguer-menu__link' to='/catalogo' onClick={onClose}>
              Impresos
            </Link>

            <div className='hamburguer-menu__submenu'>
              <Link className='hamburguer-menu__sublink' to='/novedades' onClick={onClose}>
                Novedades
              </Link>
              <Link className='hamburguer-menu__sublink' to='/libros' onClick={onClose}>
                Libros
              </Link>
              <Link className='hamburguer-menu__sublink' to='/fanzines' onClick={onClose}>
                Fanzines
              </Link>
            </div>

            <Link className='hamburguer-menu__link' to='/escritorxs' onClick={onClose}>
              Escritorxs
            </Link>
            <Link className='hamburguer-menu__link' to='/nosotrxs' onClick={onClose}>
              Nosotrxs
            </Link>
            <Link className='hamburguer-menu__link' to='/contacto' onClick={onClose}>
              Contacto
            </Link>
          </nav>

          {/* Footer con auth actions */}
          <div className="hamburguer-menu__footer">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className='hamburguer-menu__auth-btn'
                onClick={onClose}
              >
                Iniciar sesión
              </Link>
            ) : (
              <button
                className='hamburguer-menu__logout'
                onClick={handleLogoutClick}
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export { HamburguerMenu };