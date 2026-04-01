/**
 * Hook para subir imágenes a Cloudinary
 * @module hooks/useCloudinaryUpload
 */

import { useState, useCallback } from 'react';
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary';

interface UseCloudinaryUploadReturn {
  uploadImage: (file: File) => Promise<string>;
  isUploading: boolean;
  uploadError: string | null;
  clearError: () => void;
}

/**
 * Hook para manejar uploads a Cloudinary
 * Devuelve la URL segura de la imagen subida
 */
export const useCloudinaryUpload = (): UseCloudinaryUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  /**
   * Sube una imagen a Cloudinary
   * @param file - Archivo de imagen seleccionado
   * @returns Promise<string> - URL segura de la imagen
   */
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    // Validaciones básicas
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no debe superar los 5MB');
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'book_covers');

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al subir imagen');
      }

      const data = await response.json();
      
      // Devolvemos la URL segura
      return data.secure_url;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al subir';
      setUploadError(message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadImage,
    isUploading,
    uploadError,
    clearError,
  };
};