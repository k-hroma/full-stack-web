import { memo } from 'react';
import animatednav from '../../assets/img/optimized/animated-nav.webp';
import '../../styles/layout/navbar/animated-nav.css'

export const AnimatedNav = memo(function AnimatedNav() {
  return (
    <div className='animate-nav'>
      <img className='animated-nav-img' src={animatednav} alt="animated-nav" />
      <img className='animated-nav-img' src={animatednav} alt="animated-nav" />
    </div>
  );
});