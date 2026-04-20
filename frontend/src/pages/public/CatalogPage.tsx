/**
 * CatalogPage - Página de catálogo completo (impresos)
 * @module pages/public/CatalogPage
 */

import { BookGrid } from '../../components/bookGrid/BookGrid';

export default function CatalogPage() {
  return (
    <BookGrid
      title="Catálogo"
      showBackLink={true}
    />
  );
}

export { CatalogPage };
