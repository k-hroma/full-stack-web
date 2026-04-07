/**
 * BookCard - Tarjeta de libro con imagen optimizada
 * @module components/bookCard/BookCard
 */

import { useState, useMemo, memo } from 'react';
import type { Book } from '../../types/book';
import { OptimizedImage } from '../common/OptimizedImage';
import { optimizeImageUrl } from '../../utils/cloudinaryHelpers';
import '../../styles/components/book-card.css';

interface BookCardProps {
  index: number;
  book: Book;
  isInCart: boolean;
  onAddToCart: () => void;
  onViewMore: () => void;
}

const bgColors = [
  '#CDB0EA', '#383838', '#954300', '#CDB0EA',
  '#DBD0C1', '#CDB0EA', '#0A9E50', '#7D94A3',
];

const bgBorders = [
  '#954300', '#DBD0C1', '#CDB0EA', '#DBD0C1',
  '#7D94A3', '#954300', '#DBD0C1', '#0A9E50',
];

// Dimensiones base usadas solo para calcular las URLs de Cloudinary y el srcSet.
// El layout real lo dicta el CSS (cover-container → aspect-ratio: 2/3, fluid).
const CARD_W = 130;
const CARD_H = 195;

/**
 * Tamaños responsive de la card:
 * - Hasta 450px de viewport: ~50% de la pantalla (2 columnas)
 * - Hasta 660px: ~33vw (3 columnas)
 * - Hasta 880px: ~25vw (4 columnas)
 * - Por encima: tamaño fijo de 130px
 */
const CARD_SIZES = '(max-width: 450px) 50vw, (max-width: 660px) 33vw, (max-width: 880px) 25vw, 130px';

export const BookCard = memo(function BookCard({
  index,
  book,
  isInCart,
  onAddToCart,
  onViewMore,
}: BookCardProps) {
  const bgColor = bgColors[index % bgColors.length];
  const bgBorder = bgBorders[index % bgBorders.length];

  const [hover, setHover] = useState(false);

  const buttonState = useMemo(() => {
    if (isInCart) return { text: 'En carrito', disabled: true, className: 'in-cart' };
    if (book.stock === 0) return { text: 'Sin stock', disabled: true, className: 'no-stock' };
    return { text: 'Agregar', disabled: false, className: 'add' };
  }, [isInCart, book.stock]);

  const src1x = optimizeImageUrl(book.img, { width: CARD_W, height: CARD_H, quality: 'auto:good' });
  const src2x = optimizeImageUrl(book.img, { width: CARD_W * 2, height: CARD_H * 2, quality: 'auto:good' });

  return (
    <div className="item-book-container">
      <div
        style={{
          backgroundColor: bgColor,
          border: `10px solid ${hover ? '#FF76DC' : bgBorder}`,
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="cover-container"
      >
        {/*
         * img-container define el área interior (78% del cover).
         * OptimizedImage con fluid=true se adapta al 100% de ese div,
         * respetando siempre la proporción 2/3 heredada del cover-container.
         */}
        <div className="img-container">
          <OptimizedImage
            src={book.img}
            alt={book.title}
            width={CARD_W}
            height={CARD_H}
            fluid
            priority={index < 4}
            quality="auto:good"
            srcSet={[
              { url: src1x, descriptor: '1x' },
              { url: src2x, descriptor: '2x' },
            ]}
            sizes={CARD_SIZES}
          />
        </div>
      </div>

      <div className="info-container">
        <div className="info-txt-precio-container">
          <div className="txt-content">
            <p className="txt-title">{book.title}</p>
            <p className="txt-author">{book.lastName} {book.firstName}</p>
          </div>
          <div className="precio-content">
            <p>${book.price}</p>
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
