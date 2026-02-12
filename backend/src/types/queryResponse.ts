/**
 * @fileoverview Tipo de respuesta unificada para todas las API.
 * Estandariza el formato de respuesta exitosa de endpoints.
 * @module types/queryResponse
 */

import type { IRegisterUser } from "./authInterface.js";
import type { IBook } from "./bookInterface.js";

/**
 * Respuesta estandarizada para peticiones exitosas a la API.
 * Usada por todos los controladores para consistencia.
 * 
 * @interface QueryResponse
 * @property {boolean} success - Indica éxito de la operación (true)
 * @property {string} message - Descripción legible del resultado
 * @property {string} [token] - JWT para autenticación (solo en login/register)
 * @property {IBook | IBook[] | IRegisterUser | null} [data] - Payload de la respuesta
 * @property {any} [error] - Detalles técnicos de error (solo en validación Zod)
 * 
 * @example Respuesta de login exitoso:
 * { success: true, message: "User logged in", token: "eyJhbG...", data: {...} }
 * 
 * @example Respuesta de lista de libros:
 * { success: true, message: "Books retrieved", data: [{...}, {...}] }
 */
interface QueryResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: IBook | IBook[] | IRegisterUser | null;
  error?: unknown; 
}

export type { QueryResponse };