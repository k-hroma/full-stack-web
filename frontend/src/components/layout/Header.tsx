/**
 * Header - Navegación principal con carrito y auth
 * @module components/layout/Header
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { CartSidebar } from '../cart/CartSidebar';
import { AnimatedNav } from '../navbar/AnimatedNav';
import { HamburguerMenu } from '../navbar/HamburguerMenu';
import HamburguerIcon from '../../assets/icons/hamburguer-menu-icon.svg'
import lpicon from '../../assets/icons/lapalacio-logo.svg'
import usericon from '../../assets/icons/loguin-user.svg'
import { Search } from '../search/Search';
import '../../styles/layout/header.css'

export function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenNavMenu = () => { 
    setIsOpen(true);
  };
  
  const handleCloseNavMenu = () => { 
    setIsOpen(false);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className="header">
        <AnimatedNav />
        <section className='nav-bar-container'>
          {/* Izquierda: Menu hamburguesa */}
          <div className='left-nav'>
            {isOpen === true ? (
              <HamburguerMenu onClose={handleCloseNavMenu} />
            ) : (
              <button className='btn-home-menu' onClick={handleOpenNavMenu}>
                <img src={HamburguerIcon} alt="menu-icon" width='22px' height='15px' />
              </button>
            )}
          </div>
           {/* Centro: Logo */}
          <div className='center-nav'>
            <button className='btn-home-menu' onClick={handleGoHome}>
              <img src={lpicon} alt="lp-icon" width='51px' height='56px' />
            </button>
          </div>
          {/* Derecha: Auth + Búsqueda + Carrito */}
          <div className='right-nav'>
            {/* Acciones de usuario */}
            
          
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
                <button className='icon-user'>
                    <Link to="/login">
                      <img src={usericon} alt="usericon" width='25px' height='25px' />
                    </Link>
                  </button>
            )}
           
            {/*Search component*/}
            <Search />
            
             {/* Cart- open Sidebar */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="header__cart"
                aria-label={`Carrito con ${itemCount} items`}>
                <span>🛒</span>
                {itemCount > 0 && (
                <span className="header__cart-badge">{itemCount}</span>)}
              </button>
            
          </div>

        </section>

        
        
        
        
        
      </header>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
}