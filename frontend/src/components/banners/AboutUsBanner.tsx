/**
 * AboutUsBanner - Banner con imágenes optimizadas por Vite
 * @module components/banners/AboutUsBanner
 */

import aboutUsWeb from '../../assets/img/optimized/aboutUs.webp';
import aboutUsMobile from '../../assets/img/optimized/aboutUsMobile.webp';
import '../../styles/components/about-us-banner.css';

export default function AboutUsBanner() {
  return (
    <section>
      <div className='about-us-banner-container'>
        <img
          className='about-us-banner-web-img'
          src={aboutUsWeb}
          alt="Sobre nosotros"
          loading="lazy"
        />

        <img
          className='about-us-banner-mobile-img'
          src={aboutUsMobile}
          alt=""
          loading="lazy"
        />
      </div>
      <div className='line-banner-about-us'></div>
    </section>
  );
}