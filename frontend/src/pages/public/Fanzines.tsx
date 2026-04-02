/**
 * Fanzines - Página de fanzines
 * @module pages/public/Fanzines
 */

import { BookGrid } from '../../components/bookGrid/BookGrid';

export default function Fanzines() {
  return (
    <BookGrid
      title="Fanzines"
      filter={{ fanzine: true }}
      showBackLink={true}
    />
  );
}
