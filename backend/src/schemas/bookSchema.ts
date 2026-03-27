/**
 * @fileoverview Schemas Zod para validación de operaciones con libros.
 * Define reglas de validación para CRUD y búsqueda de libros.
 * @module schemas/bookSchema
 */

import { z } from "zod";

/**
 * Schema para creación de nuevos libros.
 * Todos los campos son requeridos excepto stock (default 0).
 * 
 * @constant {z.ZodObject} AddBookSchema
 * @property {string} img - URL de imagen de portada
 * @property {string} isbn - ISBN único (validación adicional recomendada)
 * @property {string} title - Título del libro
 * @property {string} lastName - Apellido del autor
 * @property {string} firstName - Nombre del autor
 * @property {string} editorial - Editorial
 * @property {number} price - Precio ≥ 0
 * @property {number} [stock=0] - Stock disponible (entero ≥ 0)
 * @property {boolean} [latestBook=false] - Es novedad
 * @property {boolean} [fanzine=false] - Es fanzine
 * @property {boolean} [showInHome=false] - Mostrar en Home
 * @property {number} [homeOrder=null] - Orden en Home (1-8)
 * @proprty {string} [description] - Descripción del libro
 * @property {string} url - URL de referencia externa
 */

/**
 * Schema para creación de nuevos libros.
 */
const AddBookSchema = z
  .object({
    img: z
      .string()
      .url({ message: "Image URL must be a valid URL" })
      .min(1, { message: "Image URL is required" }),

    isbn: z
      .string()
      .trim()
      .min(1, { message: "ISBN is required" })
      .regex(/^(?:\d{9}[\dX]|\d{13})$/, {
        message: "ISBN must be 10 or 13 digits",
      }),

    title: z
      .string()
      .trim()
      .min(1, { message: "Title is required" })
      .max(200, { message: "Title too long (max 200 chars)" }),

    lastName: z
      .string()
      .trim()
      .min(1, { message: "Author last name is required" }),

    firstName: z
      .string()
      .trim()
      .min(1, { message: "Author first name is required" }),

    editorial: z
      .string()
      .trim()
      .min(1, { message: "Editorial is required" }),

    price: z
      .number()
      .nonnegative({ message: "Price must be a positive number" }),

    stock: z
      .number()
      .int({ message: "Stock must be an integer" })
      .nonnegative({ message: "Stock must be 0 or more" })
      .default(0),

    latestBook: z.boolean().default(false),

    fanzine: z.boolean().default(false),

    showInHome: z.boolean().default(false),  
    
    homeOrder: z.number().min(1).max(8).optional().nullable().default(null),  

    description: z.string()
      .trim()
      .min(1, { message: "Description is required" }),

    url: z
      .string()
      .url({ message: "Must be a valid URL" })
      .min(1, { message: "ML URL is required" }),
  })
  .strict();


/**
 * Tipo inferido para creación de libros.
 * @typedef {z.infer<typeof AddBookSchema>} AddBookBody
 */


type AddBookBody = z.infer<typeof AddBookSchema>;

/**
 * Schema para actualización parcial de libros (PATCH).
 * Todos los campos son opcionales - solo se actualiza lo enviado.
 * 
 * @constant {z.ZodObject} UpdateBookSchema
 * @note No incluye .strict() para permitir updates parciales,
 *       pero usamos .partial() explícito para claridad
 */
const UpdateBookSchema = z
  .object({
    img: z
      .string()
      .url({ message: "Image URL must be a valid URL" })
      .min(1, { message: "Image URL is required" }),

    isbn: z
      .string()
      .trim()
      .min(1, { message: "ISBN is required" })
      .regex(/^(?:\d{9}[\dX]|\d{13})$/, {
        message: "ISBN must be 10 or 13 digits",
      }),

    title: z
      .string()
      .trim()
      .min(1, { message: "Title is required" })
      .max(200, { message: "Title too long (max 200 chars)" }),

    lastName: z
      .string()
      .trim()
      .min(1, { message: "Author last name is required" }),

    firstName: z
      .string()
      .trim()
      .min(1, { message: "Author first name is required" }),

    editorial: z
      .string()
      .trim()
      .min(1, { message: "Editorial is required" }),

    price: z
      .number()
      .nonnegative({ message: "Price must be a positive number" }),

    stock: z
      .number()
      .int({ message: "Stock must be an integer" })
      .nonnegative({ message: "Stock must be 0 or more" })
      .default(0),

    latestBook: z.boolean().default(false),

    fanzine: z.boolean().default(false),

    showInHome: z.boolean().default(false),  
    
    homeOrder: z.number().min(1).max(8).optional().nullable().default(null),  

    description: z.string()
      .trim()
      .min(1, { message: "Description is required" }),

    url: z
      .string()
      .url({ message: "Must be a valid URL" })
      .min(1, { message: "ML URL is required" }),
  })
  .strict()
  .partial();


/**
 * Tipo inferido para actualización de libros.
 * @typedef {z.infer<typeof UpdateBookSchema>} UpdateBookBody
 */


type UpdateBookBody = z.infer<typeof UpdateBookSchema>;

/**
 * Schema para parámetros de búsqueda (query string).
 * 
 * @constant {z.ZodObject} SearchBookQuerySchema
 * @property {string} term - Término de búsqueda (mínimo 1 char para evitar búsquedas vacías)
 */
const SearchBookQuerySchema = z.object({
  term: z
    .string()
    .trim()
    .min(1, { message: "Search term is required" })
    .max(100, { message: "Search term too long" }),
});


/**
 * Tipo inferido para query de búsqueda.
 * @typedef {z.infer<typeof SearchBookQuerySchema>} SearchBookQuery
 */


type SearchBookQuery = z.infer<typeof SearchBookQuerySchema>;

export type { 
  AddBookBody, 
  UpdateBookBody, 
  SearchBookQuery, 
};

export {AddBookSchema, UpdateBookSchema, SearchBookQuerySchema  }