/**
 * @fileoverview Punto de entrada principal de la aplicación.
 * Carga variables de entorno e inicia el servidor con manejo de errores fatal.
 * @module main
 */

import 'dotenv/config';

import { startServer } from "./server.js";

/**
 * Carga configuración de variables de entorno desde archivo .env
 * Debe ejecutarse antes de cualquier otra importación que use process.env
 */

/**
 * Función principal de inicialización de la aplicación.
 * Orquesta el inicio del servidor y maneja errores críticos de arranque.
 * 
 * @async
 * @function main
 * @returns {Promise<void>} No retorna valor, controla el flujo del proceso
 * @throws {never} No lanza errores hacia arriba, maneja todo con process.exit
 * 
 * @example
 * // Ejecución directa:
 * $ npm run start
 * // o
 * $ node dist/main.js
 */
const main = async (): Promise<void> => {
  try {
    /**
     * Inicia servidor HTTP y conexión a base de datos.
     * Si falla cualquiera de los dos, lanza excepción capturada abajo.
     */
    await startServer();
    
    console.log("✅ Application started successfully");
    
  } catch (error: unknown) {
    /**
     * Manejo de errores fatales durante el startup.
     * Extrae mensaje legible sin importar el tipo de error.
     */
    const message = error instanceof Error 
      ? error.message 
      : "Unknown critical error during startup";

    // Log a stderr para que sistemas externos (Docker, PM2) detecten el fallo
    console.error("❌ Fatal error during startup:", message);
    
    /**
     * Terminación del proceso con código de error (1).
     * Esto permite que:
     * - Docker reinicie el contenedor
     * - PM2 reintente el inicio
     * - CI/CD marque el build como fallido
     */
    process.exit(1);
  }
};

/**
 * Ejecuta la función principal inmediatamente.
 * No se exporta para evitar ejecuciones accidentales en tests.
 */
main();