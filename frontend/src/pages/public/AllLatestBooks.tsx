/**
 * AllLatestBooks - Página de novedades
 * @module pages/public/AllLatestBooks
 */

import { BookGrid } from '../../components/bookGrid/BookGrid';

export default function AllLatestBooks() {
  return (
    <BookGrid
      title="Novedades"
      filter={{ latestBook: true }}
      showBackLink={true}
    />
  );
}
