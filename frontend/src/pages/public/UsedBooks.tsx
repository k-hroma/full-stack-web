/**
 * Usados - Página de usados
 * @module pages/public/UsedBooks
 */

import { BookGrid } from '../../components/bookGrid/BookGrid';

export default function UsedBooks() {
  return (
    <BookGrid
      title="Usados"
      filter={{ usado: true }}
      showBackLink={true}
    />
  );
}