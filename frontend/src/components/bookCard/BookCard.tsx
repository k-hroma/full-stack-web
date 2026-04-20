/**
 * BookCard - Tarjeta de libro con imagen optimizada
 * @module components/bookCard/BookCard
 */

import { useState, useMemo, memo } from 'react';
import type { Book } from '../../types/book';
import { OptimizedImage } from '../common/OptimizedImage';
import { getBookColors } from '../../utils/bookColors';
import '../../styles/components/book-card.css';

interface BookCardProps {
  index: number;
  book: Book;
  isInCart: boolean;
  onAddToCart: () => void;
  onViewMore: () => void;
}

// Dimensiones base para los hints de <img> y el cálculo del srcSet en Cloudinary.
// El tamaño visual real lo dicta el CSS (cover-container → aspect-ratio, img-container → height 70%).
// Se usa un valor base representativo del tamaño más habitual de la card en desktop.
// OptimizedImage genera automáticamente variantes ×2 y ×3 para pantallas de alta densidad.
const CARD_W = 200;
const CARD_H = 300;

/**
 * Tamaños responsive de la card (usados por el browser para elegir la entrada del srcSet):
 * - Hasta 450px de viewport : ~50vw  (2 columnas  → ~225px)
 * - Hasta 660px             : ~33vw  (3 columnas  → ~220px)
 * - Hasta 880px             : ~25vw  (4 columnas  → ~220px)
 * - Por encima              : 200px fijo
 *
 * Con srcSet [200w, 400w, 600w] el browser siempre tiene una entrada adecuada,
 * incluso en DPR=2 o DPR=3 en móvil.
 */
const CARD_SIZES = '(max-width: 450px) 50vw, (max-width: 660px) 33vw, (max-width: 880px) 25vw, 200px';

export const BookCard = memo(function BookCard({
  index,
  book,
  isInCart,
  onAddToCart,
  onViewMore,
}: BookCardProps) {

  const { bgColor, borderColor } = getBookColors(book._id);


  const [hover, setHover] = useState(false);

  const buttonState = useMemo(() => {
    if (isInCart) return { text: 'En carrito', disabled: true, className: 'in-cart' };
    if (book.stock === 0) return { text: 'Sin stock', disabled: true, className: 'no-stock' };
    return { text: 'Agregar', disabled: false, className: 'add' };
  }, [isInCart, book.stock]);

  return (
    <div className="item-book-container">
      <div
        className="cover-container"
        style={{
          backgroundColor: bgColor,
          border: `10px solid ${hover ? '#FF76DC' : borderColor}`,
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onViewMore}
      >
        <div className="img-container">
          {/* srcSet generado automáticamente por OptimizedImage (130w / 260w) */}
          <OptimizedImage
            src={book.img}
            alt={book.title}
            width={CARD_W}
            height={CARD_H}
            fluid
            priority={index < 4}
            quality="auto:good"
            sizes={CARD_SIZES}
          />
        </div>
      </div>

      <div className="info-container">
        <div className="info-txt-precio-container">
          <div className="txt-content">
            <p className="txt-title">{book.title}</p>
            <p className="txt-author">{book.firstName} {book.lastName}</p>
          </div>
          <div className="precio-content">
            <p>${book.price.toLocaleString('es-ES')}</p>
          </div>
        </div>

        <div className="actions-container">
          <button
            className={`item-book-btn btn-primary ${buttonState.className}`}
            onClick={onAddToCart}
            disabled={buttonState.disabled}
            aria-label={
              isInCart
                ? `${book.title} ya está en el carrito`
                : book.stock === 0
                  ? `${book.title} sin stock`
                  : `Agregar ${book.title} al carrito`
            }
          >
            {buttonState.text}
          </button>

          <button
            className="item-book-btn btn-outline"
            onClick={onViewMore}
            aria-label={`Ver más detalles de ${book.title}`}
          >
            Ver más +
          </button>
        </div>
      </div>
    </div>
  );
});
