/**
 * Componente de upload de imagen con Cloudinary
 * @module components/ImageUpload
 */

import { useState, useRef, useCallback } from 'react';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import '../../styles/components/image-upload.css';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const ImageUpload = ({ value, onChange, disabled }: ImageUploadProps) => {
  const { uploadImage, isUploading, uploadError, clearError } = useCloudinaryUpload();
  const [preview, setPreview] = useState<string>(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    clearError();

    try {
      const cloudinaryUrl = await uploadImage(file);
      onChange(cloudinaryUrl);
      setPreview(cloudinaryUrl);
      URL.revokeObjectURL(localPreview);
    } catch (error) {
      console.error('Upload failed:', error);
      setPreview(value || '');
    }
  }, [uploadImage, onChange, value, clearError]);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    onChange('');
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        style={{ display: 'none' }}
      />

      <div
        className={`image-upload-area ${isUploading ? 'uploading' : ''} ${preview ? 'has-image' : ''}`}
        onClick={handleClick}
      >
        {isUploading ? (
          <div className="upload-loading">
            <span className="spinner">⏳</span>
            <p>Subiendo...</p>
          </div>
        ) : preview ? (
          <div className="image-preview-wrapper">
            <img src={preview} alt="Preview" className="image-preview" />
            <div className="image-overlay">
              <span>Cambiar imagen</span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">📷</span>
            <p>Click para seleccionar imagen</p>
            <small>JPG, PNG, WebP (máx 5MB)</small>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="upload-error">
          <span>❌ {uploadError}</span>
          <button type="button" onClick={clearError}>×</button>
        </div>
      )}

      {value && !isUploading && (
        <div className="upload-actions">
          <button
            type="button"
            className="btn-remove-image"
            onClick={handleRemove}
            disabled={disabled}
          >
            🗑️ Eliminar
          </button>
        </div>
      )}
    </div>
  );
};