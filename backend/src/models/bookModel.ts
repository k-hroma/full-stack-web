/**
 * @fileoverview Modelo Mongoose para el catálogo de libros.
 * Gestiona persistencia de libros, fanzines y novedades.
 * @module models/bookModel
 */

import { Schema, model } from "mongoose";
import type { IBook } from "../types/bookInterface.js";

/**
 * Schema de Mongoose para documentos de libros.
 * Define estructura del catálogo editorial con soporte para fanzines.
 * 
 * @constant {Schema<IBook>} bookSchema
 * 
 * @property {string} img - URL de portada (requerido, validación URL implícita)
 * @property {string} isbn - ISBN único identificador (requerido, índice único)
 * @property {string} title - Título del libro (requerido)
 * @property {string} lastName - Apellido del autor (requerido)
 * @property {string} firstName - Nombre del autor (requerido)
 * @property {string} editorial - Editorial (requerido)
 * @property {number} price - Precio de venta (requerido, ≥ 0)
 * @property {number} stock - Inventario disponible (default 0)
 * @property {boolean} latestBook - Indica novedad reciente (default false)
 * @property {boolean} fanzine - Categoría fanzine (default false)
 * @property {string} url - URL externa de referencia (requerido)
 */
const bookSchema = new Schema<IBook>(
  {
    img: {
      type: String,
      required: [true, "Book cover image URL is required"],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
      uppercase: true, // Normalización ISBN
      match: [
        /^(?:\d{9}[\dX]|\d{13})$/,
        "ISBN must be 10 or 13 characters (ISBN-10 or ISBN-13)",
      ],
    },
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Author last name is required"],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "Author first name is required"],
      trim: true,
    },
    editorial: {
      type: String,
      required: [true, "Editorial is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Price must be a valid number",
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer",
      },
    },
    latestBook: {
      type: Boolean,
      default: false,
      required: true,
    },
    fanzine: {
      type: Boolean,
      default: false,
      required: true,
    },
    url: {
      type: String,
      required: [true, "External URL is required"],
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true, // createdAt (fecha alta), updatedAt (última modificación)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Índice compuesto para búsquedas de texto.
 * Permite buscar por título, autor o editorial eficientemente.
 */
bookSchema.index({ title: "text", firstName: "text", lastName: "text", editorial: "text" });

/**
 * Índice para filtrado por categorías comunes.
 */
bookSchema.index({ fanzine: 1, latestBook: 1 });


/**
 * Virtual para nombre completo del autor.
 * No se guarda en BD, se calcula dinámicamente.
 */
bookSchema.virtual("authorFullName").get(function (this: IBook) {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Virtual para disponibilidad en stock.
 */
bookSchema.virtual("inStock").get(function (this: IBook) {
  return (this.stock ?? 0) > 0;
});

/**
 * Modelo Mongoose para la colección "books".
 * 
 * @constant {Model<IBook>} Book
 */
const Book = model<IBook>("Book", bookSchema);

export { Book };