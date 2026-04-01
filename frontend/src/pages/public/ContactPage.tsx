import { Link } from 'react-router-dom'
import '../../styles/pages/public/contact-page.css'
import bgAboutUs from '../../assets/img/optimized/bgAboutUs.webp'

export default function ContactPage() {
  return (
    <section
      className="about-us-container"
      style={{ '--bg-contact-url': `url(${bgAboutUs})` } as React.CSSProperties}
    >
      <div className="bg-img-container">
        <div className='about-us-txt-container'>
          <p>Somos una librería virtual, marika y lesbiana</p>
          <p>vendemos libros y fanzines</p>
          <Link className='contactanos' to='/contacto'>Contactanos:</Link>
          <p className='contacto'>@lapalaciolibros</p>
          <p className='contacto'>lapalaciolibros@gmail.<span className='contact-dot-com'>com</span></p>
          <p className='contact-com'>com</p>
          <Link className='link-about-us' to='/nosotrxs'>ver más de nosotrxs +</Link>
        </div>
      </div>
    </section>
  )
}
