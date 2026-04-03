import { BooksGenders } from '../../components/banners/BooksGenders'
import { LatestBooks } from './LatestBooks'
import ContactPage from './ContactPage'
import Writers from './Writers'
import '../../styles/pages/public/home.css'


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
