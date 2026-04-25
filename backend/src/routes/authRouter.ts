/**
 * @fileoverview Rutas de la API para el recurso Auth.
 * Gestiona autenticación: registro, login y registro de administradores.
 * @module routes/authRoutes
 */

import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  registerAdmin,
  refreshAccessToken, 
  logoutUser, 
  logoutAllDevices
} from "../controllers/authControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/requireRole.js";

/**
 * Rate Limiting estricto: Solo para login y registro.
 * Limita a 10 intentos por IP cada 15 minutos.
 * Los intentos exitosos no cuentan (skipSuccessfulRequests).
 * 
 * @security No se aplica a /refresh, /logout ni /admin para evitar
 *           bloquear sesiones legítimas o duplicar protecciones.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes."
  }
});

/**
 * Router de Express para rutas de autenticación.
 * @constant {Router} authRouter
 */
const authRouter = Router();

// ============================================================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================================================

/**
 * @route POST /auth/register
 * @description Registro de nuevos usuarios (rol "user" por defecto)
 * @access Public
 * @body { name, email, password }
 */
authRouter.post("/register", authLimiter, registerUser);

/**
 * @route POST /auth/login
 * @description Inicio de sesión y generación de JWT
 * @access Public
 * @body { email, password }
 * @response { token, user }
 */
authRouter.post("/login", authLimiter, loginUser);

/**
 * @route POST /auth/refresh
 * @description Renueva el Access Token usando el Refresh Token de cookie
 * @access Public (requiere cookie válida)
 * @cookie {string} refreshToken
 * @cookie {string} tokenFamily - Identificador de sesión
 * @response { token: "nuevo JWT" }
 * @important No requiere JWT en header. Protegido solo por generalLimiter global.
 */
authRouter.post("/refresh", refreshAccessToken);

/**
 * @route POST /auth/logout
 * @description Cierra sesión revocando el refresh token y limpiando cookies.
 * @access Public (requiere cookie válida)
 * @cookie {string} refreshToken - Token a revocar
 * @cookie {string} tokenFamily - Identificador de sesión
 */
authRouter.post("/logout",logoutUser);

// ============================================================================
// RUTAS PROTEGIDAS (requieren autenticación + rol admin)
// ============================================================================

/**
 * @route POST /auth/admin
 * @description Registro de nuevos administradores
 * @access Private (Admin only)
 * @security Requiere que el requester sea admin para crear otro admin
 * @body { name, email, password }
 */
authRouter.post(
  "/admin",
  authMiddleware,
  requireRole("admin"),
  registerAdmin
);

/**
 * @route POST /auth/logout-all
 * @description Cierra sesión en todos los dispositivos del usuario.
 * @access Private
 */
authRouter.post("/logout-all", authMiddleware, logoutAllDevices);

export { authRouter };