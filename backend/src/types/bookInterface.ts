/**
 * @fileoverview Interface de dominio para el módulo de libros.
 * Define la estructura de datos de libros en el catálogo.
 * @module types/bookInterface
 */

/**
 * Representa un libro en el catálogo de la librería.
 * Incluye metadatos de publicación, precio, stock y categorización.
 * 
 * @interface IBook
 * @property {string} img - URL de la imagen de portada (requerido)
 * @property {string} isbn - ISBN único identificador del libro (requerido)
 * @property {string} title - Título completo del libro (requerido)
 * @property {string} lastName - Apellido(s) del autor (requerido)
 * @property {string} firstName - Nombre(s) del autor (requerido)
 * @property {string} editorial - Editorial que publicó el libro (requerido)
 * @property {number} price - Precio de venta en moneda local (requerido, ≥0)
 * @property {number} [stock=0] - Unidades disponibles en inventario (opcional)
 * @property {boolean} latestBook - Indica si es una novedad reciente
 * @property {boolean} fanzine - Indica si pertenece a la categoría fanzine
 * @property {string} url - URL externa de referencia (ej: MercadoLibre)
 */
interface IBook {
  img: string;
  isbn: string;
  title: string;
  lastName: string;
  firstName: string;
  editorial: string;
  price: number;
  stock?: number;
  latestBook: boolean;
  fanzine: boolean;
  url: string;
}

export type { IBook };