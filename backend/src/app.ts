/**
 * @fileoverview Configuración central de la aplicación Express.
 * Define middlewares globales, rutas y manejo de errores.
 * @module app
 */

import cookieParser from "cookie-parser";
import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import { handleErrors } from './middlewares/handleErrors.js';
import { bookRouter } from './routes/bookRouter.js';
import { authRouter } from './routes/authRouter.js';


/**
 * Instancia principal de Express.
 * Configurada con middlewares esenciales y rutas de la API.
 * 
 * @constant {Application} app
 */

const app: Application = express();

// ============================================================================
// MIDDLEWARES ESENCIALES (orden importante - se ejecutan secuencialmente)
// ============================================================================

/**
 * Parseo de JSON en request bodies.
 * Convierte Content-Type: application/json → req.body objeto JavaScript.
 * Límite de 10kb para prevenir ataques de payload masivo.
 */
app.use(express.json({ limit: "10kb" }));

/**
 * Parseo de cookies en request headers.
 * Convierte Cookie: header → req.cookies objeto JavaScript.
 * Necesario para leer refresh tokens en httpOnly cookies.
 * 
 * @security Las cookies httpOnly no son accesibles por JavaScript del cliente,
 *          protegiendo contra ataques XSS que intenten robar tokens.
 */
app.use(cookieParser());

/**
 * Habilitación de CORS para comunicación cross-origin.
 * En producción, configurar con opciones específicas de origen:
 * 
 * @example Configuración restringida:
 * app.use(cors({
 *   origin: process.env.FRONTEND_URL,
 *   credentials: true,
 *   methods: ["GET", "POST", "PATCH", "DELETE"]
 * }));
 */
app.use(cors());

// Monta el router de autenticación en la ruta base /books.
// Todas las rutas internas se accederán con el prefijo /books 
app.use("/books", bookRouter)

// // Monta el router de libros en la ruta base /books.
// Todas las rutas internas se accederán con el prefijo /auth (ej: /auth/login, /auth/register).
app.use("/auth", authRouter)


// ============================================================================
// MANEJO DE ERRORES (siempre al final de la cadena de middlewares)
// ============================================================================

/**
 * Middleware global de captura de errores.
 * Captura cualquier error lanzado en rutas o middlewares anteriores.
 * 
 * @important Debe ser el último middleware registrado para capturar todo.
 */
app.use(handleErrors);

export { app };