/**
 * Configuración de Cloudinary
 * @module config/cloudinary
 *
 * Todas las variables deben vivir en .env.
 * Sin fallbacks con valores reales: si falta una variable, falla rápido y en voz alta.
 */

import { Cloudinary } from '@cloudinary/url-gen';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

if (!CLOUDINARY_CLOUD_NAME) {
  throw new Error(
    '[Cloudinary] Falta VITE_CLOUDINARY_CLOUD_NAME en el archivo .env\n' +
    'Copiá .env.example a .env y completá los valores.',
  );
}

/** Upload preset UNSIGNED (para subir imágenes desde el admin) */
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

/** URL base para uploads directos vía API */
export const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/** Instancia del SDK (disponible para transformaciones avanzadas si se necesitan) */
export const cld = new Cloudinary({
  cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
});

/** Valores válidos de calidad para las transformaciones de Cloudinary */
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
 * Construye la URL de una imagen con transformaciones aplicadas.
 * Se usa la URL manual (sin SDK) para no sumar peso al bundle en runtime.
 *
 * Transformaciones aplicadas:
 * - `q_<quality>` : calidad
 * - `f_auto`      : formato óptimo según el browser (WebP, AVIF, etc.)
 * - `c_fit`       : redimensiona sin recortar, respetando la relación de aspecto
 *
 * @param publicId - ID de la imagen en Cloudinary (ej: "book_covers/abc123")
 * @param width    - Ancho deseado en px (opcional)
 * @param height   - Alto deseado en px (opcional)
 * @param quality  - Calidad deseada. Default: 'auto:good'
 */
export const getOptimizedImageUrl = (
  publicId: string,
  width?: number,
  height?: number,
  quality: CloudinaryQuality = 'auto:good',
): string => {
  const transforms: string[] = [`q_${quality}`, 'f_auto'];

  if (width) {
    const h = height ?? width;
    transforms.push(`c_fit,w_${width},h_${h}`);
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`;
};

/**
 * Extrae el `public_id` de una URL de Cloudinary.
 * Soporta URLs con y sin versión (`v1234567890/`).
 *
 * @returns El public_id, o `null` si la URL no pertenece a Cloudinary.
 */
export const extractPublicId = (url: string): string | null => {
  if (!url?.includes('cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1].trim() : null;
};
