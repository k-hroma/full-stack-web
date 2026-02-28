/**
 * Tipos de libros - Mapeo 1:1 con backend
 * @module types/book
 */

/** Libro - coincide con IBook del backend */
export interface Book {
  _id: string;          // MongoDB ObjectId como string
  img: string;          // URL de portada
  isbn: string;         // ISBN único
  title: string;        // Título
  lastName: string;     // Apellido autor
  firstName: string;    // Nombre autor
  editorial: string;    // Editorial
  price: number;        // Precio (≥ 0)
  stock?: number;       // Stock disponible (default 0 en backend)
  latestBook: boolean;  // Es novedad
  fanzine: boolean;     // Es fanzine
  url: string;          // Link externo (MercadoLibre)
  createdAt: string;    // ISO date
  updatedAt: string;    // ISO date
}

/** Campos para crear libro - coincide con AddBookBody */
export interface CreateBookInput {
  img: string;
  isbn: string;
  title: string;
  lastName: string;
  firstName: string;
  editorial: string;
  price: number;
  stock?: number;
  latestBook?: boolean;
  fanzine?: boolean;
  url: string;
}

/** Campos para actualizar - coincide con UpdateBookBody (todo opcional) */
export type UpdateBookInput = Partial<CreateBookInput>;

/** Respuesta de lista de libros */
export interface BooksResponse {
  success: true;
  message: string;
  data: Book[];
}

/** Respuesta de libro único */
export interface BookResponse {
  success: true;
  message: string;
  data: Book;
}

/** Filtros para GET /books */
export interface BookFilters {
  fanzine?: boolean;
  latestBook?: boolean;
}

/** Query de búsqueda */
export interface SearchQuery {
  term: string;
}