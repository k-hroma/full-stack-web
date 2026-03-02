import animatednav from '../../assets/img/animation-header.png'
import '../../styles/layout/navbar/animated-nav.css'

const AnimatedNav = () => { 

  return (
    <div className='animate-nav'>
        <img className='animated-nav-img' src={animatednav} alt="animated-nav" />
        <img className='animated-nav-img' src={animatednav} alt="animated-nav" />
      </div>
  )
}

export { AnimatedNav }