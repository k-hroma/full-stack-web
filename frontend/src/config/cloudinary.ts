/**
 * Configuración de Cloudinary
 * @module config/cloudinary
 *
 * IMPORTANTE: Todas las variables deben vivir en .env
 * No uses fallbacks con valores reales aquí.
 * Si falta una variable, querés que falle rápido y en voz alta.
 */

import { Cloudinary } from '@cloudinary/url-gen';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

if (!CLOUDINARY_CLOUD_NAME) {
  throw new Error(
    '[Cloudinary] Falta VITE_CLOUDINARY_CLOUD_NAME en el archivo .env\n' +
    'Copiá .env.example a .env y completá los valores.'
  );
}

// Upload preset UNSIGNED (para subir imágenes desde el admin)
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

// URL base para uploads directos
export const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Instancia del SDK (usada si en algún momento se necesitan transformaciones avanzadas)
export const cld = new Cloudinary({
  cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
});

/**
 * Valores válidos de calidad para Cloudinary
 */
export type CloudinaryQuality =
  | 'auto'
  | 'auto:best'
  | 'auto:good'
  | 'auto:eco'
  | 'auto:low'
  | 'best'
  | 'good'
  | 'eco'
  | 'low';

/**
 * Genera la URL de una imagen transformada y optimizada.
 * Usamos la URL manual (sin SDK) para no depender del bundle del SDK en runtime.
 *
 * @param publicId - ID de la imagen en Cloudinary (ej: "book_covers/abc123")
 * @param width    - Ancho deseado en px (opcional)
 * @param height   - Alto deseado en px (opcional)
 * @param quality  - Calidad deseada (default: 'auto:good')
 */
export const getOptimizedImageUrl = (
  publicId: string,
  width?: number,
  height?: number,
  quality: CloudinaryQuality = 'auto:good',
): string => {
  const transforms: string[] = [`q_${quality}`, 'f_auto'];

  if (width) {
    const h = height || width;
    transforms.push(`c_fit,w_${width},h_${h}`);
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`;
};

/**
 * Extrae el public_id de una URL de Cloudinary.
 * Soporta URLs con y sin versión (v1234567890/).
 *
 * @param url - URL completa de Cloudinary
 * @returns public_id o null si no es URL de Cloudinary
 */
export const extractPublicId = (url: string): string | null => {
  if (!url?.includes('cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1].trim() : null;
};
