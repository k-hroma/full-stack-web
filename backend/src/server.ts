/** @module server
 */
import { app } from './app.js';
import { connectMongoDB } from './config/mongoDB.js';

const PORT = Number(process.env.PORT) || 3000;

/**
 * Inicializa el servidor HTTP y la conexión a base de datos.
 * Implementa patrón de inicio secuencial: BD primero, HTTP después.
 * 
 * @async
 * @function startServer
 * @returns {Promise<void>} Resuelve cuando el servidor está escuchando
 * @throws {Error} Si falla conexión a BD o servidor no puede iniciar
 * 
 * @example
 * await startServer();
 * // 🚀 Server running on port 3000
 * // 📦 MongoDB connected successfully
 */

const startServer = async (): Promise<void> => {
  // Validación temprana de configuración crítica
  if (!PORT || isNaN(PORT)) {
    throw new Error(`Invalid PORT environment variable: "${process.env.PORT}". `);
  }

  /**
   * PASO 1: Conexión a base de datos.
   * El servidor no inicia si la BD no está disponible.
   * Esto evita requests fallidos por falta de conectividad.
   */
  const dbConnection = await connectMongoDB();
  console.log(`📦 ${dbConnection.message}`);

  /**
   * PASO 2: Inicio del servidor HTTP.
   * Envuelto en Promise para poder usar async/await y capturar errores de bind.
   */
  await new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API endpoint: http://localhost:${PORT}/books`);
      resolve();
    });

    server.on('error', (error: Error) => {
      reject(new Error(`Server failed to start on port ${PORT}: ${error.message}`));
    });
  });
};

export { startServer };