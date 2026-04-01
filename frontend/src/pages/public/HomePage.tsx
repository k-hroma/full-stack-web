import { BooksGenders } from '../../components/banners/BooksGenders'
import '../../styles/pages/public/home.css'
import ContactPage from './ContactPage'
import { LatestBooks } from './LatestBooks'
import Writers from './Writers'
import headerBg from '../../assets/img/optimized/header-hero.webp'

export default function HomePage() {
  return (
    <section className='home-container'>
      <div className="home-bg-img-container">
        <img
          src={headerBg}
          alt="Banner principal"
          className="home-hero-img"
        />
      </div>
      <LatestBooks />
      <Writers />
      <BooksGenders />
      <ContactPage />
    </section>
  )
}
