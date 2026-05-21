/**
 * @module server
 */

import { app } from './app.js';
import { connectMongoDB } from './config/mongoDB.js';
import mongoose from 'mongoose';
import type { Server } from 'node:http';

/**
 * Bandera para evitar shutdown múltiple.
 * Se mantiene como estado privado del módulo.
 * @type {boolean}
 */
let isShuttingDown = false;

/**
 * Cierre ordenado de servicios para evitar cortes bruscos.
 * Centraliza la lógica de shutdown para reutilizarse desde múltiples handlers.
 *
 * @async
 * @function gracefulShutdown
 * @param {Server} server - Instancia del servidor HTTP Express
 * @param {string} signal - Nombre de la señal o evento que disparó el shutdown
 * @returns {Promise<void>} Resuelve cuando el shutdown se completó
 * @description
 * Secuencia de cierre:
 * 1) Deja de aceptar nuevas requests HTTP
 * 2) Cierra conexión a MongoDB
 * 3) Finaliza proceso con código de salida apropiado
 * Incluye timeout de 15s para evitar bloqueos indefinidos.
 */
export const gracefulShutdown = async (server: Server, signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  console.log(`🛑 Received ${signal}. Starting graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    console.error('❌ Forced shutdown: graceful shutdown timeout exceeded (15s)');
    process.exit(1);
  }, 15000);

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error?: Error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    await mongoose.connection.close(false);

    clearTimeout(forceExitTimer);
    console.log('✅ Graceful shutdown completed successfully');
    process.exit(0);

  } catch (error: unknown) {
    clearTimeout(forceExitTimer);
    const message = error instanceof Error ? error.message : 'Unknown shutdown error';
    console.error(`❌ Error during graceful shutdown: ${message}`);
    process.exit(1);
  }
};

/**
 * Registra todos los handlers de apagado y errores fatales del proceso.
 * Centraliza en un único lugar: señales del SO (SIGINT, SIGTERM) y
 * errores críticos no capturados (uncaughtException, unhandledRejection).
 *
 * @function setupShutdownHandlers
 * @param {Server} server - Instancia del servidor HTTP para cerrar en caso de shutdown
 * @returns {void} No retorna valor, solo registra los handlers
 * @description
 * Se invoca DESPUÉS de que el servidor esté escuchando, garantizando
 * que `gracefulShutdown` siempre tenga una instancia válida de `server`.
 */
export const setupShutdownHandlers = (server: Server): void => {
  /**
   * Manejador de excepciones no capturadas (Uncaught Exception).
   * Captura errores síncronos que escapan a cualquier try-catch.
   *
   * @security Crítico para evitar que el servidor siga corriendo en estado inestable.
   * @process Evento: uncaughtException
   */
  process.on('uncaughtException', (error: Error) => {
    console.error('❌ UNCAUGHT EXCEPTION:', error);

    if (!isShuttingDown) {
      console.error('💥 Critical error detected. Shutting down gracefully...');
      void gracefulShutdown(server, 'uncaughtException');
    }
  });

  /**
   * Manejador de promesas rechazadas no manejadas (Unhandled Rejection).
   * Captura errores asíncronos que no tuvieron .catch().
   *
   * @process Evento: unhandledRejection
   * @important En Node.js, las unhandledRejections pueden convertirse en uncaughtExceptions
   * en versiones futuras, por lo que es obligatorio manejarlas.
   */
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('❌ UNHANDLED REJECTION at Promise:', promise);
    console.error('Reason:', reason);

    if (!isShuttingDown) {
      console.error('💥 Critical async error detected. Shutting down gracefully...');
      void gracefulShutdown(server, 'unhandledRejection');
    }
  });

  // Registrar señales del sistema operativo para apagado ordenado
  process.on('SIGINT', () => {
    void gracefulShutdown(server, 'SIGINT');
  });

  process.on('SIGTERM', () => {
    void gracefulShutdown(server, 'SIGTERM');
  });
};

/**
 * Inicializa el servidor HTTP y la conexión a base de datos.
 * Implementa patrón de inicio secuencial: BD primero, HTTP después.
 * NO registra handlers de proceso; eso es responsabilidad del consumidor
 * vía {@link setupShutdownHandlers}.
 *
 * @async
 * @function startServer
 * @returns {Promise<<Server>} Resuelve con la instancia del servidor HTTP activo
 * @throws {Error} Si falla conexión a BD o servidor no puede iniciar
 */
export const startServer = async (): Promise<Server> => {
  
  // ==========================================
  // VALIDACIÓN DE CONFIGURACIÓN (Type-safe)
  // ==========================================
  
  const jwtSecret = process.env.JWT_SECRET;
  const mongoUri = process.env.MONGO_URI;
  const portEnv = process.env.PORT;

  if (!jwtSecret) {
    throw new Error(
      'Missing required environment variable: JWT_SECRET\n' +
      'Please set it in your .env file (e.g., JWT_SECRET=your_super_secret_key)'
    );
  }

  if (!mongoUri) {
    throw new Error(
      'Missing required environment variable: MONGO_URI\n' +
      'Please set it in your .env file (e.g., MONGO_URI=mongodb://localhost:27017/mydb)'
    );
  }

  /**
   * Validación estricta de longitud de JWT_SECRET para producción.
   * @security Menos de 32 caracteres es inseguro para HS256.
   * @throws {Error} Si la clave es demasiado corta.
   */
  if (jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters for production security.\n' +
      `Current length: ${jwtSecret.length} characters. ` +
      'Generate a secure key with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }

  // Validar PORT (con fallback a 3000)
  const PORT = portEnv ? Number(portEnv) : 3000;
  
  if (portEnv && (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535)) {
    throw new Error(
      `Invalid PORT environment variable: "${portEnv}". ` +
      `Must be an integer between 1 and 65535.`
    );
  }

  // ==========================================
  // INICIO DE SERVICIOS
  // ==========================================

  /**
   * PASO 1: Conexión a base de datos.
   * El servidor no inicia si la BD no está disponible.
   */
  const dbConnection = await connectMongoDB();
  console.log(`📦 ${dbConnection.message}`);

  /**
   * PASO 2: Inicio del servidor HTTP.
   * Retorna la instancia para que el consumidor pueda inyectarla
   * en los handlers de shutdown y tests de integración.
   */
  const server = await new Promise<Server>((resolve, reject) => {
    const serverInstance = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔐 JWT authentication: enabled`);
      console.log(`📚 API endpoint: http://localhost:${PORT}/books`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      resolve(serverInstance);
    });

    serverInstance.once('error', (error: Error) => {
      reject(new Error(`Server failed to start on port ${PORT}: ${error.message}`));
    });
  });

  return server;
};

/**
 * Sequential startup pattern → Inicializar dependencias críticas en orden.
 * Environment configuration validation → Verificar variables de entorno al arrancar.
 * Type narrowing → Reducir tipos ambiguos mediante validaciones explícitas.
 * Security-first configuration → Exigir JWT_SECRET robusto desde el startup.
 * Promise wrapping de APIs callback-based → Convertir callbacks en Promises.
 * Fail-fast startup validation → Abortar inmediatamente si config o BD son inválidos.
 * Graceful shutdown orchestration → Cierre ordenado de HTTP, BD y proceso.
 * Signal handling (SIGINT/SIGTERM) → Escuchar señales del SO para apagado correcto.
 * Force-exit timeout strategy → Timeout de 15s para evitar bloqueos indefinidos.
 * Connection draining → Dejar de aceptar nuevas conexiones HTTP antes de cerrar.
 * Resource lifecycle management → Administrar apertura y cierre de recursos críticos.
 * Operational observability → Logs claros de startup, endpoints, errores y shutdown.
 * Health check exposure → Endpoints de verificación para orquestadores.
 * Idempotent shutdown protection → Evitar múltiples ejecuciones simultáneas.
 * Process exit code semantics → Códigos de salida distintos para éxito/error.
 * Defensive error normalization → Convertir errores unknown en mensajes seguros.
 * Infrastructure-aware backend design → Pensar en Docker, PM2 y Kubernetes.
 * Separation of concerns → Separar arranque de servicios del registro de handlers.
 * Single source of truth → Un único lugar para la lógica de shutdown.
 */