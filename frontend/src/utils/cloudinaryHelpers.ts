/**
 * Helpers para trabajar con URLs de Cloudinary
 * @module utils/cloudinaryHelpers
 */

import { getOptimizedImageUrl, extractPublicId } from '../config/cloudinary';

/**
 * Opciones para optimización de imágenes
 */
interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
}

/**
 * Optimiza una URL de imagen (Cloudinary o externa)
 * Si es Cloudinary: aplica transformaciones
 * Si es externa (imgbb, etc.): devuelve la URL original
 */
export const optimizeImageUrl = (url: string, options: OptimizeOptions = {}): string => {
  const { width = 300, height } = options;
  
  // Intentar extraer public_id de Cloudinary
  const publicId = extractPublicId(url);
  
  if (publicId) {
    // Es Cloudinary - aplicar transformaciones
    return getOptimizedImageUrl(publicId, width, height);
  }
  
  // No es Cloudinary (imgbb, etc.) - devolver original
  return url;
};

/**
 * Genera srcset para imágenes responsive
 * Solo funciona con Cloudinary
 */
export const generateSrcSet = (url: string, widths: number[] = [150, 300, 600]): string => {
  const publicId = extractPublicId(url);
  
  if (!publicId) {
    // No es Cloudinary, no podemos generar srcset
    return '';
  }
  
  return widths
    .map(w => `${getOptimizedImageUrl(publicId, w)} ${w}w`)
    .join(', ');
};