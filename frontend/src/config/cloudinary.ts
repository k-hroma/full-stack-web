/**
 * Configuración de Cloudinary
 * @module config/cloudinary
 */

import { Cloudinary } from '@cloudinary/url-gen';

// Tu cloud name de Cloudinary
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ds8ww3in3';

// Upload preset UNSIGNED 
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// URL base para uploads
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Instancia de Cloudinary para transformaciones
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME,
  },
});

/**
 * Genera la URL de una imagen transformada (optimizada)
 * @param publicId - ID de la imagen en Cloudinary (ej: "book_covers/abc123")
 * @param width - Ancho deseado (opcional)
 * @param height - Alto deseado (opcional)
 * @returns URL optimizada con formato WebP/avif automático
 */
export const getOptimizedImageUrl = (publicId: string, width?: number, height?: number): string => {
  const cloudName = CLOUDINARY_CLOUD_NAME;
  
  // LIMPIAR publicId de espacios
  const cleanPublicId = publicId.trim();
  
  // Transformaciones
  const transforms = [];
  transforms.push('q_auto');
  transforms.push('f_auto');
  
  if (width) {
    const h = height || width;
    transforms.push(`c_fill,w_${width},h_${h}`);
  }
  
  const transformString = transforms.join(',');
  
  // Construir URL con concatenación
  const baseUrl = 'https://res.cloudinary.com/';
  const path = '/image/upload/';
  return baseUrl + cloudName + path + transformString + '/' + cleanPublicId;
};

/**
 * Extrae el public_id de una URL de Cloudinary
 * Útil para convertir URLs existentes en URLs transformadas
 * @param url - URL completa de Cloudinary
 * @returns public_id o null si no es URL de Cloudinary
 */
export const extractPublicId = (url: string): string | null => {
  // Regex para extraer public_id de URLs tipo:
  // https://res.cloudinary.com/cloudname/image/upload/v1234567890/book_covers/abc123.jpg
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/);
  return match ? match[1].trim() : null;
};