/**
 * BooksGenders - Banner de géneros con imágenes optimizadas por Vite
 * @module components/banners/BooksGenders
 */

import gender from '../../assets/img/optimized/banner.png';
import gendermobile from '../../assets/img/optimized/bannerSmall.png';
import '../../styles/components/book-genders.css';

const BooksGenders = () => {
  return (
    <section className="books-genders-container">
      <img
        className='banner-img'
        src={gender}
        alt="gender-banner"
        loading="lazy"
      />

      <img
        className='banner-img-mobile'
        src={gendermobile}
        alt="gender-banner-mobile"
        loading="lazy"
      />
    </section>
  );
}

export { BooksGenders };