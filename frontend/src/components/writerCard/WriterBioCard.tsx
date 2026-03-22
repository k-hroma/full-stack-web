import type { Book } from '../../types/book';
import { BookDetailModal } from '../bookDetailModal/BookDetailModal';
import { useCart } from '../../hooks/useCart';
import '../../styles/pages/public/writer-bio-card.css'
import { useState } from 'react';

interface WriterBioCardProps {
  book: Book;
  isInCart: boolean;
  onAddToCart: () => void;
  onViewMore: () => void;
  onClose: () => void;

}

export default function WriterBioCard({ book }: WriterBioCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { addToCart, isInCart } = useCart();

  const handleOpen = () => {
    setIsOpen(true)
  }
  const handleCloseModal = () => {
    setIsOpen(false);
  };
  return (
    <div>
      <div className="writer-bio-container">
        <p className="featured-quote">“Me  gusta pensar que estás leyendo y que si digo mar, ves tu propio mar. Que así sea. Dejame creer...” </p>
        <p className='writer-sub-quote'>{book.firstName} {book.lastName} * § * {book.title} </p> { /*CAMBIAR PETITE QUOTE*/}
        <hr className="writer-bio-line" />
        <div className="writer-bio-wrapper">
          <div className="writer-details-bio-books">
            <div className='writer-bio-name-last-name'>
              <p>{book.firstName} </p>
              <p>{book.lastName}</p>
            </div>
            <div className='writer-books-titles'>
              <p>Libros disponibles</p>
              <ul>
                <li>
                  <button
                    className='writer-titles-btn'
                    onClick={handleOpen}
                  >
                    {book.title}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className='writer-bio-description'>
            <p >Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem, atque inventore cum quia odio praesentium consequatur assumenda autem corporis maxime? Doloribus dolores necessitatibus similique, reprehenderit vel voluptate ex sed veritatis.
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Doloribus, reprehenderit ipsam voluptatem nulla, perspiciatis placeat quasi blanditiis beatae officiis dicta sunt culpa mollitia alias numquam ab tempore quis reiciendis tenetur.
            </p>
          </div>

        </div>

      </div>

      <div>
        {isOpen &&
          <BookDetailModal
            book={book}
            isInCart={isInCart(book._id)}
            onAddToCart={() => addToCart(book)}
            isOpen={isOpen}
            onClose={handleCloseModal}
          />
        }
      </div>

    </div>
  )
}
