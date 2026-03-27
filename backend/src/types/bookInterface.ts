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
 * @property {number} [stock=0] - Unidades disponibles en inventario 
 * @property {boolean} latestBook - Indica si es una novedad reciente
 * @property {boolean} fanzine - Indica si pertenece a la categoría fanzine
 * @property {boolean} showInHome - Indica si se quiere mostrar en la página principal
 * @property {number} homeOrder - Indica la posición en la cual mosrar el libro en caso de estar en la página ppal
 * @property {string} [description] - Descripción detallada del libro (opcional)
 * @property {string} url - URL externa de referencia (ej: MercadoLibre)(opcional)
 */
interface IBook {
  img: string;
  isbn: string;
  title: string;
  lastName: string;
  firstName: string;
  editorial: string;
  price: number;
  stock: number;
  latestBook: boolean;
  fanzine: boolean;
  showInHome: boolean; 
  homeOrder: number | null;
  description: string;
  url: string;
}

export type { IBook };