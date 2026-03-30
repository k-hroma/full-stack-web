import '../../styles/components/book-genders.css'
import gender from '../../assets/img/banner.png'
import gendermobile from '../../assets/img/bannerSmall.png'

const BooksGenders = () => {
  return (
    <section className="books-genders-container">

      <img className='banner-img' src={gender} alt="gender-banner" />

      <img className='banner-img-mobile' src={gendermobile} alt="gender-banner-mobile" />

    </section>
  );
}

export { BooksGenders }


