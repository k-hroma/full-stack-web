import { BooksGenders } from '../../components/banners/BooksGenders'
import '../../styles/pages/public/home.css'
import ContactPage from './ContactPage'
import { LatestBooks } from './LatestBooks'
import Writers from './Writers'


export default function HomePage() {
  return (
    <section className='home-container'>
      <div className="home-bg-img-container">
      </div>
      <LatestBooks />
      <Writers />
      <BooksGenders />
      <ContactPage />
    </section>
  )
}
