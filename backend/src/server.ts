/**
 * @module server
 */

import { app } from './app.js';
import { connectMongoDB } from './config/mongoDB.js';

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
  const mongoUri = process.env.MONGODB_URI;
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
      'Missing required environment variable: MONGODB_URI\n' +
      'Please set it in your .env file (e.g., MONGODB_URI=mongodb://localhost:27017/mydb)'
    );
  }

  // Validar longitud mínima de JWT_SECRET para seguridad
  if (jwtSecret.length < 32) {
    console.warn('⚠️  Warning: JWT_SECRET should be at least 32 characters for security');
  }

  // Validar PORT (con fallback a 3000)
  const PORT = Number(portEnv) || 3000;
  
  if (portEnv && (isNaN(PORT) || PORT < 1 || PORT > 65535)) {
    throw new Error(
      `Invalid PORT environment variable: "${portEnv}". ` +
      `Must be a number between 1 and 65535.`
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
  await new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔐 JWT authentication: enabled`);
      console.log(`📚 API endpoint: http://localhost:${PORT}/books`);
      resolve();
    });

    server.on('error', (error: Error) => {
      reject(new Error(`Server failed to start on port ${PORT}: ${error.message}`));
    });
  });
};

export { startServer };