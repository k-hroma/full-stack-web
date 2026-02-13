/**
 * @fileoverview Middleware de autenticación JWT.
 * Verifica tokens Bearer y adjunta payload decodificado al request.
 * @module middleware/authMiddleware
 */

import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { ErrorResults } from "../types/errorResults.js";
import type { AuthPayload } from "../types/authPayload.js";

/**
 * Middleware de autenticación: verifica JWT y añade datos de usuario al request.
 * 
 * @function authMiddleware
 * @async
 * @param {Request} req - Request de Express (se modifica con req.user)
 * @param {Response<ErrorResult>} res - Response para errores 401/500
 * @param {NextFunction} next - Continúa a siguiente middleware si auth exitosa
 * @returns {Promise<void>}
 * 
 * @throws {Error} Si JWT_SECRET no está configurado (error 500)
 * @throws {Error} Si token es inválido o expirado (error 401)
 * 
 * @header {string} Authorization - "Bearer <token_jwt>"
 * 
 * @example Request exitosa:
 * // req.user = { id: "...", name: "...", email: "...", role: "..." }
 * next();
 * 
 * @example Error de token expirado:
 * // res.status(401).json({ success: false, message: "jwt expired" })
 */
const authMiddleware = async (
  req: Request,
  res: Response<ErrorResults>,
  next: NextFunction
): Promise<void> => {
  
  const authHeader = req.headers.authorization;

  // Validación de presencia y formato del header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authorization required. Provide Bearer token in Authorization header.",
    });
    return;
  }

  // Extracción del token (remove "Bearer " prefix)
  const token = authHeader.substring(7).trim();

  // Validación de configuración del servidor
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error("[AUTH CONFIG ERROR] JWT_SECRET not defined in environment");
    res.status(500).json({
      success: false,
      message: "Server configuration error: authentication service unavailable",
    });
    return;
  }

  try {
    // Verificación y decodificación del token
    const decoded = jwt.verify(token, secretKey) as AuthPayload;
    // El método jwt.verify() hace dos cosas:
    //1. Verifica que el token sea válido (firma correcta, no expirado)
    //2. Decodifica y retorna el payload (los datos que guardaste al crear el token):>
    // decoded = {id:"string" , name: "string", email "string", role "user|admin"} (el payload que cree en jwt.sign)
    
    // Adjuntar datos de usuario al request para uso posterior
    req.user = decoded;

    // desde acá se puede: 
    //req.user?.id
    //req.user?.role

    
    // Continuar a siguiente middleware o controller
    next();
    
  } catch (error: unknown) {
    // Manejo específico de errores de JWT
    let message = "Invalid or expired token";
    
    if (error instanceof jwt.TokenExpiredError) {
      message = "Token expired. Please login again.";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Invalid token format.";
    }

    res.status(401).json({
      success: false,
      message,
    });
  }
};

export { authMiddleware };