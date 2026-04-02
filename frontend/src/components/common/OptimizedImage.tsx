import { useState } from 'react';
import {
  optimizeImageUrl,
  generateSrcSet,
  srcSetToString,
  type SrcSetEntry,
} from '../../utils/cloudinaryHelpers';
import type { CloudinaryQuality } from '../../config/cloudinary';
import '../../styles/components/optimized-image.css';

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Las primeras imágenes en viewport usan eager; el resto lazy (default: false) */
  priority?: boolean;
  /** Calidad Cloudinary. Default: 'auto:good' */
  quality?: CloudinaryQuality;
  /**
   * srcSet manual para imágenes responsive.
   * Acepta descriptores de densidad ('1x', '2x') o de ancho ('320w').
   * Si no se pasa, se calcula automáticamente solo para URLs de Cloudinary.
   */
  srcSet?: SrcSetEntry[];
  /**
   * Valor del atributo sizes. Indica al navegador qué tamaño tendrá la imagen
   * en distintos breakpoints. Default: '<width>px'.
   * Ejemplo: "(max-width: 768px) 100vw, 130px"
   */
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 'auto:good',
  srcSet,
  sizes,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Optimizar URL principal (aplica calidad + formato automático si es Cloudinary)
  const optimizedSrc = optimizeImageUrl(src, { width, height, quality });

  // Resolver srcSet:
  //   1. Usar el array manual si fue pasado explícitamente.
  //   2. Si no, auto-generar 1x/2x para URLs de Cloudinary (vacío para otras).
  const autoSrcSet = generateSrcSet(src, [width, width * 2], height, quality);
  const resolvedSrcSetStr = srcSetToString(srcSet ?? autoSrcSet);

  const resolvedSizes = sizes ?? `${width}px`;

  if (error) {
    return (
      <div className="image-fallback" style={{ width, height }}>
        📚
      </div>
    );
  }

  return (
    <div className="image-wrapper" style={{ width, height }}>
      {!loaded && <div className="image-skeleton" aria-hidden="true" />}

      <img
        src={optimizedSrc}
        srcSet={resolvedSrcSetStr || undefined}
        sizes={resolvedSrcSetStr ? resolvedSizes : undefined}
        alt={alt}
        width={width}
        height={height}
        className={`optimized-img${loaded ? ' visible' : ''}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  );
}
