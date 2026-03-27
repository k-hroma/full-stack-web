/**
 * @fileoverview Tipos para respuestas de error estandarizadas.
 * Define la estructura base de errores en respuestas API.
 * @module types/errorResult
 */

/**
 * Estructura estandarizada para respuestas de error de la API.
 * Compatible con el middleware global handleErrors.
 * 
 * @interface ErrorResult
 * @property {boolean} success - Siempre false para errores
 * @property {string} message - Mensaje descriptivo del error
 * @property {number | string} [errorCode] - Código HTTP o identificador interno
 * @example
 * { success: false, message: "Invalid credentials", errorCode: 401 }
 */
interface ErrorResult {
  success: boolean;
  message: string;
  errorCode?: number | string;
}

export type { ErrorResult };