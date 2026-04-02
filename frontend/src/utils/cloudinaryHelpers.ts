/**
 * Helpers para trabajar con URLs de Cloudinary
 * @module utils/cloudinaryHelpers
 */

import { getOptimizedImageUrl, extractPublicId, type CloudinaryQuality } from '../config/cloudinary';

/**
 * Opciones para optimización de imágenes
 */
interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: CloudinaryQuality;
}

/**
 * Optimiza una URL de imagen (Cloudinary o externa)
 * Si es Cloudinary: aplica transformaciones con calidad y formato automático.
 * Si es externa (imgbb, etc.): devuelve la URL original.
 */
export const optimizeImageUrl = (url: string, options: OptimizeOptions = {}): string => {
  const { width = 300, height, quality = 'auto:good' } = options;

  const publicId = extractPublicId(url);

  if (publicId) {
    return getOptimizedImageUrl(publicId, width, height, quality);
  }

  // No es Cloudinary — devolver original sin modificar
  return url;
};

/**
 * Descriptor de una entrada del atributo srcset
 */
export interface SrcSetEntry {
  url: string;
  descriptor: string; // e.g. '1x', '2x', '320w', '640w'
}

/**
 * Genera un array de SrcSetEntry para imágenes responsive.
 * Solo funciona con Cloudinary; devuelve [] para otras URLs.
 *
 * @param url     - URL de la imagen (Cloudinary o externa)
 * @param widths  - Anchos a generar (default: [150, 300, 600])
 * @param height  - Alto a aplicar en todas las variantes (opcional)
 * @param quality - Calidad a aplicar en todas las variantes (default: 'auto:good')
 */
export const generateSrcSet = (
  url: string,
  widths: number[] = [150, 300, 600],
  height?: number,
  quality: CloudinaryQuality = 'auto:good',
): SrcSetEntry[] => {
  const publicId = extractPublicId(url);

  if (!publicId) {
    return [];
  }

  return widths.map((w) => ({
    url: getOptimizedImageUrl(publicId, w, height, quality),
    descriptor: `${w}w`,
  }));
};

/**
 * Convierte un array de SrcSetEntry en el string listo para el atributo srcset.
 * Acepta tanto SrcSetEntry[] como un string heredado (lo devuelve tal cual).
 */
export const srcSetToString = (srcSet: SrcSetEntry[] | string): string => {
  if (typeof srcSet === 'string') return srcSet;
  return srcSet.map(({ url, descriptor }) => `${url} ${descriptor}`).join(', ');
};
