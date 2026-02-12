import type { Request, Response, NextFunction } from "express"
import type { ErrorResults } from "../types/errorResults.js"

// Middleware centralizado para manejo de errores.
// Captura cualquier error lanzado en los controllers.
const handleErrors =  (error: unknown, _req: Request, res: Response<ErrorResults>, _next: NextFunction): void => {
  // Determinar mensaje de error
  const message = error instanceof Error ? error.message : "Unknown error";
  // Determinar código HTTP (solo confiar en error.status si es número válido)
  const statusCode = typeof (error as any).status === "number" 
    ? (error as any).status 
    : 500;
  
  // Envía respuesta JSON con código de error y mensaje
  res.status(statusCode).json({
    success: false,
    message,
    errorCode: statusCode,
  });
 }

export { handleErrors }



