/**
 * @fileoverview Middleware centralizado para manejo de errores HTTP.
 * Captura y estandariza respuestas de error en toda la aplicación.
 * @module middleware/handleErrors
 */

import type { Request, Response, NextFunction } from "express";
import type { ErrorResult } from "../types/errorResult.js";

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  code?: string | number;
  value?: unknown;
  path?: string;
  keyValue?: Record<string, unknown>;
}

const handleErrors = (
  error: HttpError,
  _req: Request,
  res: Response<ErrorResult>,
  _next: NextFunction
): void => {
  
  let statusCode = 
    typeof error.status === "number" ? error.status :
    typeof error.statusCode === "number" ? error.statusCode :
    500;

  let message = error.message || "Internal server error";

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path || 'value'}: ${error.value}. Expected valid format.`;
  }
  else if (error.code === 11000 && error.keyValue) {
    statusCode = 409;
    const field = Object.keys(error.keyValue)[0];
    const value = field ? error.keyValue[field] : undefined;
    
    if (field && value !== undefined) {
      message = `${field} '${value}' already exists.`;
    } else {
      message = "Duplicate key error: Field already exists.";
    }
  }
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  }

  const isDevelopment = process.env.NODE_ENV === "development";
  
  const errorResponse: ErrorResult = {
    success: false,
    message: isDevelopment ? message : sanitizeMessage(message, statusCode),
    errorCode: statusCode,
  };

  if (isDevelopment) {
    console.error(`[ERROR ${statusCode}]`, {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
    });
  } else {
    console.error(`[ERROR ${statusCode}]`, message);
  }

  res.status(statusCode).json(errorResponse);
};

const sanitizeMessage = (message: string, statusCode: number): string => {
  if (statusCode >= 400 && statusCode < 500) {
    return message;
  }
  return "An unexpected error occurred. Please try again later.";
};

export { handleErrors };