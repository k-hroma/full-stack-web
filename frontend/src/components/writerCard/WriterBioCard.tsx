import type { Book } from '../../types/book';

interface WriterBioCardProps {
  book: Book;
}


export default function WriterBioCard({ book }: WriterBioCardProps) {
  console.log(book)
  return (
    <div>
      <div className="writer-bio-container">
        <h1 className="featured-quote">Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam corporis nostrum quos? Dolore, sint incidunt vel debitis praesentium illum perspiciatis atque, nulla quidem, cupiditate placeat sequi odio hic voluptatum illo.</h1>
        <hr className="writer-bio-line" />
        <div className="writer-bio-wrapper">
          <div className="writer-books">
            <p>{book.firstName} {book.lastName}</p>
            <h3>Libros disponibles</h3>
            <ul>
              <li>{book.title}</li>
            </ul>
          </div>
          <div>
            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Repellat, cumque perferendis nam aperiam eaque, rem adipisci iure consequuntur saepe fugiat voluptate laudantium numquam inventore. Temporibus doloribus itaque sint in ducimus.</p>
          </div>

        </div>

      </div>

    </div>
  )
}
