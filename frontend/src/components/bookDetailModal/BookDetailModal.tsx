import { useState } from 'react';
import type { Book } from '../../types/book';
import '../../styles/components/book-detail-modal.css';

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
  isInCart
}: BookDetailModalProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!isOpen || !book) return null;

  const getButtonState = () => {
    if (isInCart) return { text: 'En carrito', disabled: true };
    if (book.stock === 0) return { text: 'Sin stock', disabled: true };
    return { text: 'Agregar', disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-content">
          {/* Columna izquierda - Imagen */}
          <div className="modal-image-section">
            <div className="modal-image-border">
              <div className="modal-image-wrapper">
                {!imgLoaded && (
                  <div
                    className="modal-image-skeleton"
                    aria-hidden="true"
                    style={{ width: 300, height: 450 }}
                  />
                )}
                <img
                  src={book.img}
                  alt={book.title}
                  className="modal-image"
                  width={300}
                  height={450}
                  style={{
                    aspectRatio: '2/3',
                    objectFit: 'cover',
                    display: imgLoaded ? 'block' : 'none',
                  }}
                  onLoad={() => setImgLoaded(true)}
                />
              </div>
            </div>
          </div>

          {/* Columna derecha - Información */}
          <div className="modal-info-section">
            <div className="modal-header">
              <span className="modal-category">Impresos // Libro</span>
              <h2 className="modal-title">{book.title}</h2>
              <p className="modal-author">{book.firstName} {book.lastName}</p>
            </div>

            <div className="modal-price-section">
              <span className="modal-price">${book.price.toLocaleString()}</span>
              <button
                className={`modal-interest-btn ${isInCart ? 'in-cart' : ''} ${book.stock === 0 ? 'no-stock' : ''}`}
                onClick={onAddToCart}
                disabled={buttonState.disabled}
              >
                {buttonState.text}
              </button>
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