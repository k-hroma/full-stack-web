/**
 * @fileoverview Tipos de resultado para operaciones de conexión.
 * Estandariza respuestas de conectores de base de datos.
 * @module types/connectionResults
 */

/**
 * Resultado estandarizado de una operación de conexión a base de datos.
 * Usado por connectMongoDB para comunicar estado de conexión.
 * 
 * @interface ConnectResults
 * @property {boolean} success - Indica si la operación fue exitosa
 * @property {string} message - Descripción legible del resultado
 * @example
 * { success: true, message: "MongoDB connected successfully" }
 * @example
 * { success: false, message: "Connection timeout after 5000ms" }
 */
interface ConnectResults {
  success: boolean;
  message: string;
}

export type { ConnectResults };