/**
 * @fileoverview Configuración central de la aplicación Express.
 * Define middlewares globales, rutas y manejo de errores.
 * @module app
 */

import cookieParser from "cookie-parser";
import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { handleErrors } from './middlewares/handleErrors.js';
import { bookRouter } from './routes/bookRouter.js';
import { authRouter } from './routes/authRouter.js';
import { writerRouter } from "./routes/writerRouter.js";

type CorsCallback = (err: Error | null, allow?: boolean) => void;

/**
 * Instancia principal de Express.
 * Configurada con middlewares esenciales y rutas de la API.
 * 
 * @constant {Application} app
 */
const app: Application = express();

// Confía en el proxy de Render para obtener IP real del cliente
app.set('trust proxy', 1);
// ============================================================================
// CONFIGURACIÓN DE SEGURIDAD (Helmet + Rate Limiting)
// ============================================================================

/**
 * Helmet: Configuración de headers de seguridad HTTP.
 * Protege contra XSS, clickjacking, MIME sniffing y otros ataques comunes.
 * 
 * @security Desactiva X-Powered-By, configura CSP, HSTS, y otros headers.
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Desactivado para permitir imágenes de URLs externas
}));

/**
 * Rate Limiting general: Protección contra fuerza bruta y DDoS básicos.
 * Limita a 100 requests por IP cada 15 minutos para endpoints no críticos.
 * 
 * @constant {rateLimit.RateLimit} generalLimiter
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  }
});

/**
 * Rate Limiting estricto: Para endpoints de autenticación.
 * Limita a 5 intentos por IP cada 15 minutos (login/register).
 * 
 * @constant {rateLimit.RateLimit} authLimiter
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos de login/register por IP
  skipSuccessfulRequests: true, // No cuenta los logins exitosos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes."
  }
});

// Aplicar rate limiting general a toda la app
app.use(generalLimiter);

// ============================================================================
// CORS CONFIGURACIÓN DINÁMICA (Producción vs Desarrollo)
// ============================================================================

/**
 * Validación crítica de seguridad para producción:
 * FRONTEND_URL debe estar definido explícitamente en producción para evitar
 * que el fallback a localhost permita accesos no autorizados desde entornos
 * de desarrollo locales.
 * 
 * @security Si NODE_ENV=production y no hay FRONTEND_URL, la app no inicia.
 *           Esto previene configuraciones inseguras por defecto.
 */
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  throw new Error(
    'SECURITY ERROR: FRONTEND_URL environment variable is required in production.\n' +
    'Please set it to your production frontend domain (e.g., https://mibiblioteca.com)'
  );
}

/**
 * Configuración de CORS dinámica basada en variables de entorno.
 * En producción, solo permite el origen definido en FRONTEND_URL.
 * En desarrollo, permite localhost.
 * 
 * @security credentials: true permite cookies httpOnly en cross-origin.
 */

/*
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
};

*/
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://frontend-libreria-api.vercel.app",
];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: CorsCallback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
};

app.use(cors(corsOptions));

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

// ============================================================================
// HEALTH CHECK ENDPOINT (FASE 2: Estabilidad)
// ============================================================================

/**
 * Endpoint de health check para orquestadores de contenedores (Docker, Kubernetes).
 * Permite verificar el estado de la aplicación y la conexión a BD.
 * 
 * @route GET /health
 * @returns {Object} Estado de la aplicación
 * @property {string} status - "ok" o "error"
 * @property {string} database - "connected" (1) o "disconnected" (0)
 * @property {string} timestamp - ISO timestamp de la respuesta
 * @status 200 Si todo está operativo
 * @status 503 Si la BD está desconectada
 */
app.get('/health', (_req: Request, res: Response) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = mongoose.connection.readyState;
  
  const isHealthy = dbState === 1; // 1 = connected
  
  const healthCheck = {
    status: isHealthy ? 'ok' : 'error',
    database: dbStates[dbState] || 'unknown',
    timestamp: new Date().toISOString()
  };
  
  res.status(isHealthy ? 200 : 503).json(healthCheck);
});

// ============================================================================
// RUTAS DE LA API
// ============================================================================

/**
 * Monta el router de libros en la ruta base /books.
 * Todas las rutas internas se accederán con el prefijo /books
 * (ej: GET /books, POST /books, PATCH /books/:id)
 */
app.use("/books", bookRouter);

/**
 * Monta el router de autenticación en la ruta base /auth.
 * Rate limiting estricto aplicado solo a estas rutas sensibles.
 * Todas las rutas internas se accederán con el prefijo /auth
 * (ej: /auth/login, /auth/register, /auth/refresh)
 */
app.use("/auth", authLimiter, authRouter);

app.use("/writers", writerRouter);

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