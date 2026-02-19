/**
 * @fileoverview Rutas de la API para el recurso Auth.
 * Gestiona autenticación: registro, login y registro de administradores.
 * @module routes/authRoutes
 */

import { Router } from "express";
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
authRouter.post("/register", registerUser);

/**
 * @route POST /auth/login
 * @description Inicio de sesión y generación de JWT
 * @access Public
 * @body { email, password }
 * @response { token, user }
 */
authRouter.post("/login", loginUser);

/**
 * @route POST /auth/refresh
 * @description Renueva el Access Token usando el Refresh Token de cookie
 * @access Public (requiere cookie válida)
 * @cookie {string} refreshToken
 * @cookie {string} tokenFamily - Identificador de sesión
 * @response { token: "nuevo JWT" }
 * @important No requiere JWT en header. Las cookies son el "ticket" de acceso.
 */
authRouter.post("/refresh", refreshAccessToken);

/**
 * @route POST /auth/logout
 * @description Cierra sesión revocando el refresh token y limpiando cookies.
 * @access Public (requiere cookie válida)
 * @cookie {string} refreshToken -Token a revocar
 * @cookie {string} tokenFamily - Identificador de sesión
 * @returns {Promise<void>}
 */
authRouter.post("/logout", logoutUser);

// ============================================================================
// RUTAS PROTEGIDAS (requieren autenticación + rol admin)
// ============================================================================

/**
 * @route POST /auth/admin
 * @description Registro de nuevos administradores
 * @access Private (Admin only)
 * @security Requiere que el requester sea admin para crear otro admin
 * @body { name, email, password }
 * 
 * @important Este endpoint permite escalamiento de privilegios controlado.
 * Solo usuarios autenticados con rol "admin" pueden crear más admins.
 */
authRouter.post(
  "/admin",
  authMiddleware,      // Verificar JWT válido
  requireRole("admin"), // Verificar que sea admin
  registerAdmin
);

authRouter.post("/logout-all", authMiddleware, logoutAllDevices);
export { authRouter };