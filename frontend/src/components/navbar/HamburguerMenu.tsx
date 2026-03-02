import { Link } from 'react-router-dom'
import closeHamburguerMenuIcon from '../../assets/icons/hamburguer-close.svg'
import '../../styles/layout/navbar/hamburguer-menu.css'

interface HamburguerMenuProps {
  onClose: () => void
}

const HamburguerMenu = ({onClose}:HamburguerMenuProps) => {
  return (
    <section className="open-nav-menu-container">
      <div className='links-container'>
        <button
          className='close-button'
          type='button'
          onClick={onClose}
        >
          <img
            src={closeHamburguerMenuIcon}
            alt="clos-nav-icon"
            width="28"
            height="18"
          />
        </button>

        <div className="menu-links-wrapper">
          <Link className='menu-link' to='/' onClick={onClose}>
            Impresos
          </Link>

          <div className='sub-menu-container'>
            <Link className='sub-menu-link' to='/novedades' onClick={onClose}>
              Novedades
            </Link>
            <Link className='sub-menu-link' to='/libros' onClick={onClose}>
              Libros
            </Link>
            <Link className='sub-menu-link' to='/fanzines' onClick={onClose}>
              Fanzines
            </Link>
          </div>

          <Link className='menu-link' to='/escritorxs' onClick={onClose}>
            Escritorxs
          </Link>
          <Link className='menu-link' to='/nosotrxs' onClick={onClose}>
            Nosotrxs
          </Link>
          <Link className='menu-link' to='/contacto' onClick={onClose}>
            Contacto
          </Link>
        </div>
      </div>
    </section>
  )
}

export {HamburguerMenu }
