/**
 * OptimizedImage - Imagen con lazy loading, skeleton y srcSet automático
 * @module components/common/OptimizedImage
 */

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
  /** Las primeras imágenes en viewport usan eager + fetchPriority high. Default: false */
  priority?: boolean;
  /** Calidad Cloudinary. Default: 'auto:good' */
  quality?: CloudinaryQuality;
  /**
   * srcSet manual para casos con descriptores de densidad ('1x', '2x') o anchos custom.
   * Si se omite, se genera automáticamente con descriptores de anchura (130w, 260w)
   * lo cual es preferible para imágenes en grillas responsive.
   */
  srcSet?: SrcSetEntry[];
  /**
   * Valor del atributo `sizes`. Indica al browser el ancho visual en cada breakpoint.
   * Default: `<width>px`.
   * Ejemplo: "(max-width: 768px) 100vw, 130px"
   */
  sizes?: string;
  /**
   * Cuando es true, el wrapper ocupa el 100% del contenedor padre.
   * width/height se siguen usando para los hints de <img> y el cálculo del srcSet.
   */
  fluid?: boolean;
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
  fluid = false,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const optimizedSrc = optimizeImageUrl(src, { width, height, quality });

  // Usa el srcSet explícito si se provee; si no, genera automáticamente con descriptores de anchura.
  // IMPORTANTE: no se pasa `height` a generateSrcSet intencionalmente.
  // Con c_fit, pasar el mismo height fijo para todos los anchos hace que Cloudinary limite
  // la imagen al bounding box más pequeño → el 2x sale con la misma resolución que el 1x.
  // Solo constrañir por ancho deja que c_fit preserve el aspect ratio original.
  const resolvedSrcSet = srcSetToString(srcSet ?? generateSrcSet(src, [width, width * 2, width * 3], undefined, quality));
  const resolvedSizes = sizes ?? `${width}px`;

  if (error) {
    return (
      <div
        className={`image-fallback${fluid ? ' fluid' : ''}`}
        style={fluid ? undefined : { width, height }}
      >
        📚
      </div>
    );
  }

  return (
    <div
      className={`image-wrapper${fluid ? ' fluid' : ''}`}
      style={fluid ? undefined : { width, height }}
    >
      {!loaded && <div className="image-skeleton" aria-hidden="true" />}

      <img
        src={optimizedSrc}
        srcSet={resolvedSrcSet || undefined}
        sizes={resolvedSrcSet ? resolvedSizes : undefined}
        alt={alt}
        width={width}
        height={height}
        className={`optimized-img${loaded ? ' visible' : ''}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
