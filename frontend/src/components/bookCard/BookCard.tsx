/**
 * BookCard - Tarjeta de libro con imagen optimizada
 * @module components/bookCard/BookCard
 */

import type { Book } from '../../types/book'
import { useState } from "react";
import { OptimizedImage } from '../common/OptimizedImage';
import '../../styles/components/book-card.css'

interface BookCardProps {
  index: number
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

const BookCard = ({
  index,
  book,
  isInCart,
  onAddToCart,
  onViewMore
}: BookCardProps) => {
  const bgColor = bgColors[index % bgColors.length];
  const bgBorder = bgBorders[index % bgBorders.length];

  const [hover, setHover] = useState(false);

  const getButtonState = () => {
    if (isInCart) return { text: 'En carrito', disabled: true, className: 'in-cart' };
    if (book.stock === 0) return { text: 'Sin stock', disabled: true, className: 'no-stock' };
    return { text: 'Agregar', disabled: false, className: 'add' };
  };

  const buttonState = getButtonState();

  return (
    <div className='item-book-container'>
      <div
        style={{
          backgroundColor: bgColor,
          border: `10px solid ${hover ? '#FF76DC' : bgBorder}`
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className='cover-container'
      >
        <div className='img-container'>
          <OptimizedImage
            src={book.img}
            alt={book.title}
            width={130}
            height={195}
            priority={index < 4}
          />
        </div>
      </div>

      <div className='info-container'>
        <div className='info-txt-precio-container'>
          <div className='txt-content'>
            <p className='txt-title'>{book.title}</p>
            <p className='txt-author'>{book.lastName} {book.firstName}</p>
          </div>
          <div className='precio-content'>
            <p>${book.price}</p>
          </div>
        </div>

        <div className='actions-container'>
          <button
            className={`item-book-btn btn-primary ${buttonState.className}`}
            onClick={onAddToCart}
            disabled={buttonState.disabled}
          >
            {buttonState.text}
          </button>
          <button
            className='item-book-btn btn-outline'
            onClick={onViewMore}>
            Ver más +
          </button>
        </div>
      </div>
    </div>
  );
}

export { BookCard }