/**
 * BookDetailModal - Modal de detalle de libro
 * @module components/bookDetailModal/BookDetailModal
 */

import { useState } from 'react';
import type { Book } from '../../types/book';
import { optimizeImageUrl } from '../../utils/cloudinaryHelpers';
import '../../styles/components/book-detail-modal.css';

// Tamaño exacto del contenedor de imagen dentro del modal
const MODAL_W = 300;
const MODAL_H = 450;

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  isInCart: boolean;
}

export const BookDetailModal = ({
  book,
  isOpen,
  onClose,
  onAddToCart,
  isInCart,
}: BookDetailModalProps) => {
  // Hook declarado antes del early return (regla de hooks)
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!isOpen || !book) return null;

  // URLs optimizadas de Cloudinary.
  // Para c_fit, pasar solo el ancho es suficiente: Cloudinary preserva el aspect ratio original.
  // El height se pasa solo como referencia proporcional para que el bounding box sea correcto.
  const imgSrc = optimizeImageUrl(book.img, { width: MODAL_W, height: MODAL_H, quality: 'auto:good' });
  const imgSrc2x = optimizeImageUrl(book.img, { width: MODAL_W * 2, height: MODAL_H * 2, quality: 'auto:good' });
  const imgSrcSet = `${imgSrc} 1x, ${imgSrc2x} 2x`;

  const buttonText = isInCart ? 'En carrito' : book.stock === 0 ? 'Sin stock' : 'Agregar';
  const buttonDisabled = isInCart || book.stock === 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-content">

          {/* Columna izquierda — Imagen */}
          <div className="modal-image-section">
            <div className="modal-image-border">
              <div className="modal-image-wrapper">
                {!imgLoaded && (
                  <div
                    className="modal-image-skeleton"
                    aria-hidden="true"
                    style={{ width: MODAL_W, height: MODAL_H }}
                  />
                )}
                <img
                  src={imgSrc}
                  srcSet={imgSrcSet}
                  sizes={`${MODAL_W}px`}
                  alt={book.title}
                  className="modal-image"
                  width={MODAL_W}
                  height={MODAL_H}
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  style={{
                    aspectRatio: '2/3',
                    objectFit: 'contain',
                    display: imgLoaded ? 'block' : 'none',
                  }}
                  onLoad={() => setImgLoaded(true)}
                />
              </div>
            </div>
          </div>

          {/* Columna derecha — Información */}
          <div className="modal-info-section">
            <div className="modal-header">
              <span className="modal-category">Impresos // Libro</span>
              <h2 className="modal-title">{book.title}</h2>
              <p className="modal-author">{book.firstName} {book.lastName}</p>
            </div>

            <div className="modal-price-section">
              <div>
                <span className="modal-price">${book.price.toLocaleString('es-ES')}</span>
              </div>
              <div className='btn-container'>
                <button
                  className={`modal-interest-btn ${isInCart ? 'in-cart' : ''} ${book.stock === 0 ? 'no-stock' : ''}`}
                  onClick={onAddToCart}
                  disabled={buttonDisabled}
                  aria-label={
                    isInCart
                      ? `${book.title} ya está en el carrito`
                      : book.stock === 0
                        ? `${book.title} sin stock`
                        : `Agregar ${book.title} al carrito`
                  }
                >
                  {buttonText}
                </button>
              </div>
            </div>

            <div className="modal-metadata">
              <div className="metadata-item">
                <span className="metadata-label">ISBN:</span>
                <span className="metadata-value">{book.isbn || 'No disponible'}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Editorial:</span>
                <span className="metadata-value">{book.editorial || 'Rara Avis'}</span>
              </div>
            </div>

            <div className="modal-description">
              <h3 className="description-label">Descripción:</h3>
              <div className="description-text">
                <p>{book.description || 'Descripción no disponible.'}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
