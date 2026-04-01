import { BooksGenders } from '../../components/banners/BooksGenders'
import '../../styles/pages/public/home.css'
import ContactPage from './ContactPage'
import { LatestBooks } from './LatestBooks'
import Writers from './Writers'
import headerBg from '../../assets/img/optimized/header-hero.webp'

export default function HomePage() {
  return (
    <section className='home-container'>
      <div
        className="home-bg-img-container"
        style={{ '--bg-hero-url': `url(${headerBg})` } as React.CSSProperties}
      >
      </div>
      <LatestBooks />
      <Writers />
      <BooksGenders />
      <ContactPage />
    </section>
  )
}
