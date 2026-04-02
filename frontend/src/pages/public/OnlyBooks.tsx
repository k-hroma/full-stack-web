/**
 * OnlyBooks - Página de libros (sin fanzines)
 * @module pages/public/OnlyBooks
 */

import { BookGrid } from '../../components/bookGrid/BookGrid';

export default function OnlyBooks() {
  return (
    <BookGrid
      title="Libros"
      filter={{ fanzine: false }}
      showBackLink={true}
    />
  );
}
