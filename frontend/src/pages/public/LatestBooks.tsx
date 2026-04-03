/**
 * LatestBooks - Sección de novedades en Home
 * Delega fetch, estado, loading y preload a BookGrid.
 * @module pages/public/LatestBooks
 */

import { BookGrid } from '../../components/bookGrid/BookGrid';
import type { Book } from '../../types/book';

/**
 * Ordenamiento por homeOrder ascendente; sin orden → al final por fecha DESC.
 *
 * Definido FUERA del componente para que la referencia sea estable entre renders.
 * Si estuviera adentro, BookGrid recibiría una función nueva en cada render
 * y dispararía el re-fetch continuamente (aunque los datos no cambien).
 *
 * Corrección respecto al original: usa `!= null` en vez de truthiness check,
 * así homeOrder=0 no se trata como "sin orden".
 */
const homeOrderSort = (a: Book, b: Book): number => {
  if (a.homeOrder != null && b.homeOrder != null) return a.homeOrder - b.homeOrder;
  if (a.homeOrder != null) return -1;
  if (b.homeOrder != null) return 1;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

const LatestBooks = () => (
  <BookGrid
    title="Novedades"
    filter={{ showInHome: true }}
    maxItems={8}
    sortFn={homeOrderSort}
    preloadFirst={4}
  />
);

export { LatestBooks };
