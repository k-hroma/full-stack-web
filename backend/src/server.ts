/**
 * @module server
 */

import { app } from './app.js';
import { connectMongoDB } from './config/mongoDB.js';
import mongoose from 'mongoose';
import type { Server } from 'node:http';

/**
 * Inicializa el servidor HTTP y la conexión a base de datos.
 * Implementa patrón de inicio secuencial: BD primero, HTTP después.
 * 
 * @async
 * @function startServer
 * @returns {Promise<void>} Resuelve cuando el servidor está escuchando
 * @throws {Error} Si falla conexión a BD o servidor no puede iniciar
 */

const startServer = async (): Promise<void> => {
  
  // ==========================================
  // VALIDACIÓN DE CONFIGURACIÓN (Type-safe)
  // ==========================================
  
  // Extraer variables de entorno a constantes locales
  // Esto permite narrowing de tipos (TypeScript sabe que no son undefined después)
  const jwtSecret = process.env.JWT_SECRET;
  const mongoUri = process.env.MONGO_URI;
  const portEnv = process.env.PORT;

  // Validar variables requeridas
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

  // ==========================================
  // APAGADO GRACEFUL (SIGINT / SIGTERM)
  // ==========================================
  let isShuttingDown = false;

  /**
   * Cierre ordenado de servicios para evitar cortes bruscos:
   * 1) Deja de aceptar nuevas requests HTTP
   * 2) Cierra conexión a MongoDB
   * 3) Finaliza proceso con código de salida apropiado
   */
  const gracefulShutdown = async (signal: string): Promise<void> => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;

    console.log(`🛑 Received ${signal}. Starting graceful shutdown...`);

    // Timeout de seguridad: evita que el proceso quede colgado indefinidamente
    const forceExitTimer = setTimeout(() => {
      console.error('❌ Forced shutdown: graceful shutdown timeout exceeded (15s)');
      process.exit(1);
    }, 15000);

    try {
      // PASO 1: detener servidor HTTP (no acepta conexiones nuevas)
      await new Promise<void>((resolve, reject) => {
        server.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });

      // PASO 2: cerrar conexión MongoDB de forma limpia
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

  // Registrar señales del sistema operativo para apagado ordenado
  process.on('SIGINT', () => {
    void gracefulShutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void gracefulShutdown('SIGTERM');
  });
};

export { startServer };