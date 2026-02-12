/**
 * @fileoverview Middleware centralizado para manejo de errores HTTP.
 * Captura y estandariza respuestas de error en toda la aplicación.
 * @module middleware/handleErrors
 */

import type { Request, Response, NextFunction } from "express";
import type { ErrorResult } from "../types/errorResults.js";

/**
 * Tipo extendido de Error con propiedades HTTP opcionales.
 * Permite que controllers lancen errores con código de estado específico.
 * 
 * @interface HttpError
 * @extends Error
 */


interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  code?: string | number;
}

/**
 * Middleware final de manejo de errores (4 parámetros = error handler en Express).
 * Captura cualquier error lanzado en controllers o middlewares previos.
 * 
 * @function handleErrors
 * @param {HttpError} error - Error capturado (puede ser Error estándar o custom)
 * @param {Request} _req - Request de Express (no usado pero requerido por firma)
 * @param {Response<ErrorResult>} res - Response tipada con formato de error
 * @param {NextFunction} _next - Next function (no usado, es el final de la cadena)
 * @returns {void} Envía respuesta JSON, no continúa la cadena
 * 
 * @important Debe registrarse AL FINAL de app.ts, después de todas las rutas.
 * @important Express identifica middlewares de error por tener 4 parámetros.
 * 
 * @example Error lanzado desde controller:
 * const error = new Error("User not found");
 * (error as HttpError).status = 404;
 * next(error);
 */

const handleErrors = (
  error: HttpError,
  _req: Request,
  res: Response<ErrorResult>,
  _next: NextFunction
): void => {
  // Determinar código HTTP: error.status → error.statusCode → 500 (default)
  const statusCode = 
    typeof error.status === "number" ? error.status :
    typeof error.statusCode === "number" ? error.statusCode :
    500;

  // Mensaje seguro: nunca exponer stack traces en producción
  const isDevelopment = process.env.NODE_ENV === "development";
  const message = error.message || "Internal server error";
  
  // Construir respuesta de error estandarizada
  const errorResponse: ErrorResult = {
    success: false,
    message: isDevelopment ? message : sanitizeMessage(message, statusCode),
    errorCode: statusCode,
  };

  // Log detallado solo en desarrollo
  if (isDevelopment) {
    console.error(`[ERROR ${statusCode}]`, {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
  } else {
    // Log seguro en producción (sin datos sensibles)
    console.error(`[ERROR ${statusCode}]`, message);
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Sanitiza mensajes de error para no exponer detalles internos en producción.
 * 
 * @function sanitizeMessage
 * @param {string} message - Mensaje original del error
 * @param {number} statusCode - Código HTTP del error
 * @returns {string} Mensaje seguro para el cliente
 */

const sanitizeMessage = (message: string, statusCode: number): string => {
  // Errores de cliente (4xx): mensaje original es seguro
  if (statusCode >= 400 && statusCode < 500) {
    return message;
  }
  
  // Errores de servidor (5xx): ocultar detalles internos
  return "An unexpected error occurred. Please try again later.";
};

export { handleErrors };