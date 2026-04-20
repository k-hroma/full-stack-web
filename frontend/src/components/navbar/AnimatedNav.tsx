import { memo } from 'react';
import animatednav from '../../assets/img/optimized/animated-nav.png';
import '../../styles/layout/navbar/animated-nav.css'

export const AnimatedNav = memo(function AnimatedNav() {
  return (
    <div className='animate-nav' style={{ height: 20 }}>
      <img
        className='animated-nav-img'
        src={animatednav}
        alt=""
        aria-hidden="true"
        width={1000}
        height={20}
        /* Carga eager: está above-the-fold y visible inmediatamente */
        loading="eager"
        fetchPriority="low"
      />
      <img
        className='animated-nav-img'
        src={animatednav}
        alt=""
        aria-hidden="true"
        width={1000}
        height={20}
        loading="eager"
        fetchPriority="low"
      />
    </div>
  );
});