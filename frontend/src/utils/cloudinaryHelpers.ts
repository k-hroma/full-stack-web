/**
 * Helpers para construir y transformar URLs de Cloudinary
 * @module utils/cloudinaryHelpers
 */

import { getOptimizedImageUrl, extractPublicId, type CloudinaryQuality } from '../config/cloudinary';

interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: CloudinaryQuality;
}

/**
 * Devuelve la URL optimizada de una imagen.
 * - URLs de Cloudinary : aplica transformaciones (tamaño, calidad, formato automático).
 * - URLs externas      : devuelve la URL original sin modificar.
 */
export const optimizeImageUrl = (url: string, options: OptimizeOptions = {}): string => {
  const { width = 300, height, quality = 'auto:good' } = options;
  const publicId = extractPublicId(url);
  return publicId
    ? getOptimizedImageUrl(publicId, width, height, quality)
    : url;
};

/** Descriptor de una entrada del atributo `srcset` */
export interface SrcSetEntry {
  url: string;
  /** Descriptor de anchura ('320w') o densidad ('1x', '2x') */
  descriptor: string;
}

/**
 * Genera un array de SrcSetEntry con descriptores de anchura para imágenes responsive.
 * Solo funciona con URLs de Cloudinary; devuelve `[]` para cualquier otra URL.
 *
 * ⚠️  Sobre el parámetro `height`:
 * Con `c_fit`, Cloudinary ajusta la imagen para que quepa dentro del bounding box `w×h`.
 * Si pasás un `height` fijo para todos los anchos, las variantes más anchas quedan
 * limitadas por ese alto → una portada 2:3 en `w_260,h_195` sale de 130px (no 260px).
 * Lo correcto es no pasar `height`, o escalarlo proporcionalmente con cada ancho.
 * Ver: https://cloudinary.com/documentation/transformation_reference#c_fit
 *
 * @param url     - URL de la imagen
 * @param widths  - Anchos a generar. Default: [150, 300, 600]
 * @param height  - Alto del bounding box (opcional; si se pasa, debe escalar con cada ancho)
 * @param quality - Calidad de Cloudinary. Default: 'auto:good'
 */
export const generateSrcSet = (
  url: string,
  widths: number[] = [150, 300, 600],
  height?: number,
  quality: CloudinaryQuality = 'auto:good',
): SrcSetEntry[] => {
  const publicId = extractPublicId(url);
  if (!publicId) return [];

  return widths.map((w) => ({
    url: getOptimizedImageUrl(publicId, w, height, quality),
    descriptor: `${w}w`,
  }));
};

/**
 * Convierte un array de SrcSetEntry en el string listo para el atributo `srcset`.
 * Si recibe un string (legado), lo devuelve tal cual.
 */
export const srcSetToString = (srcSet: SrcSetEntry[] | string): string => {
  if (typeof srcSet === 'string') return srcSet;
  return srcSet.map(({ url, descriptor }) => `${url} ${descriptor}`).join(', ');
};
