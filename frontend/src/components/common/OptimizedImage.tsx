import { useState } from 'react';
import { optimizeImageUrl, generateSrcSet } from '../../utils/cloudinaryHelpers';
import '../../styles/components/optimized-image.css';

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, width, height, priority = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Optimizar URL si es Cloudinary
  const optimizedSrc = optimizeImageUrl(src, { width, height });

  // Generar srcset solo para Cloudinary (para imágenes responsive)
  const srcSet = generateSrcSet(src, [width, width * 2]);

  // Fallback simple si falla
  if (error) {
    return (
      <div
        className="image-fallback"
        style={{ width, height }}
      >
        📚
      </div>
    );
  }

  return (
    <div className="image-wrapper" style={{ width, height }}>
      {/* Skeleton - se oculta cuando carga */}
      {!loaded && <div className="image-skeleton" />}

      {/* Imagen real */}
      <img
        src={optimizedSrc}
        srcSet={srcSet || undefined}
        sizes={`${width}px`}
        alt={alt}
        width={width}
        height={height}
        className={`optimized-img ${loaded ? 'visible' : ''}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
      />
    </div>
  );
}