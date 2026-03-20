import type { Book } from '../../types/book'
import { useState } from "react";
import '../../styles/components/book-card.css'

// Componente interno: Tarjeta de libro
interface BookCardProps {
  index: number
  book: Book;
  isInCart: boolean;
  onAddToCart: () => void;
  onViewMore: () => void;
}


const BookCard = ({ index, book, isInCart, onAddToCart, onViewMore }: BookCardProps) => {
  const bgColors = [
    '#CDB0EA', '#383838', '#954300', '#CDB0EA',
    '#DBD0C1', '#CDB0EA', '#34C759', '#7D94A3',
  ];

  const bgBorders = [
    '#954300', '#DBD0C1', '#CDB0EA', '#DBD0C1',
    '#7D94A3', '#954300', '#DBD0C1', '#34C759',
  ];

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
        style={hover
          ? { backgroundColor: bgColor, border: "10px solid #FF76DC" }
          : { backgroundColor: bgColor, border: `10px solid ${bgBorder}` }
        }
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className='cover-container'
      >
        <div className='img-container'>
          <img
            src={book.img}
            alt={book.title}
            height='195px'
            width='130px'
            loading="lazy"
          />
        </div>
      </div>

      <div className='info-container'>
        <div className='info-txt-precio-container'>
          <div className='txt-content'>
            <p className='txt-title'>{book.title.toUpperCase()}</p>
          </div>
          <div className='precio-content'>
            <p>${book.price}</p>
          </div>
        </div>

        <div className='details-section'>
          <p className='txt-author'>{book.lastName} {book.firstName}</p>

          <div className='actions-container'>
            <button
              className='item-book-btn btn-outline'
              onClick={onViewMore}>
              ver más
            </button>
            <button
              className={`item-book-btn btn-primary ${buttonState.className}`}
              onClick={onAddToCart}
              disabled={buttonState.disabled}
            >
              {buttonState.text}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BookCard }