import '../../styles/components/book-genders.css'
import gender from '../../assets/img/banner.png'

const BooksGenders = () => {
  return (
    <section className="books-genders-container">

      <img className='banner-img' src={gender} alt="gender-banner" />

    </section>
  );
}

export { BooksGenders }


