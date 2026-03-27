/**
 * @fileoverview Modelo Mongoose para el dominio de escritores.
 * Gestiona persistencia de autores/escritores con soporte para búsqueda de texto.
 * @module models/writerModel
 */

import { Schema, model } from 'mongoose';
import type { IWriter } from '../types/writerInterface.js';

/**
 * Schema de Mongoose para documentos de escritores.
 * 
 * @constant {Schema<IWriter>} writerSchema
 * @property {boolean} recomended - Indica si es un autor destacado/recomendado
 * @property {string} lastName - Apellido(s) del autor
 * @property {string} firstName - Nombre(s) del autor  
 * @property {string} titleBookQuote - Título de obra o cita destacada
 * @property {string} bioQuote - Cita representativa del autor
 * @property {string} bioDescription - Biografía completa del autor
 */
const writerSchema = new Schema<IWriter>(
  {
    recomended: {
      type: Boolean,
      default: false,
      required:true,
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
    titleBookQuote: {
      type: String, 
      required: [true, "Title book quote is required"],
      trim: true,
    },
    bioQuote: {
    type: String, 
    required: [true, "Quote is required"], 
      trim: true,
    },
    bioDescription: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Índice de búsqueda de texto (Full Text Search).
 * 
 * @performance Permite búsquedas eficientes por nombre y apellido usando $text.
 * Ejemplo: db.writers.find({ $text: { $search: "Gabriel García" } })
 * 
 * @note Este índice es case-insensitive y elimina stop words automáticamente.
 *       Requiere MongoDB 2.4+ con soporte para text search.
 */
writerSchema.index({ firstName: "text", lastName: "text" });

/**
 * Virtual para nombre completo del autor.
 * Consistencia con el modelo Book que tiene authorFullName.
 * No se persiste en BD, se calcula dinámicamente.
 * 
 * @virtual
 * @returns {string} Concatenación de firstName + lastName
 */
writerSchema.virtual("fullName").get(function (this: IWriter) {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Modelo Mongoose para la colección "writers".
 * 
 * @constant {Model<IWriter>} Writer
 */
const Writer = model<IWriter>("Writer", writerSchema);

export {Writer};