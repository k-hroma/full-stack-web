import bannerAboutUs from '../../assets/img/aboutUs.png';
import '../../styles/components/about-us-banner.css';
import bannerAboutUsMobile from '../../assets/img/aboutUsMobile.png'
export default function AboutUsBanner() {
  return (
    <section>

      <div className='about-us-banner-container'>
        <img className='about-us-banner-web-img' src={bannerAboutUs} alt="Sobre nosotros" />

        <img className='about-us-banner-mobile-img' src={bannerAboutUsMobile} alt="" />
      </div>
      <div className='line-banner-about-us'>

      </div>
    </section>


  )
}
