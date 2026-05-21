/**
 * @fileoverview Punto de entrada principal de la aplicación.
 * Carga variables de entorno e inicia el servidor con manejo de errores fatal.
 * Orquesta el registro de handlers de shutdown una vez que el servidor está activo.
 * @module main
 */

// librería dotenv carga variables del archivo .env
// tiene que ser el primer import en ejecutarse porque en JS/TS los imports se ejecutan inmediatamente
// Top-level execution: cuando importo un módulo Node no solo lo referencia sino que lo ejecuta.
import 'dotenv/config';

import { startServer, setupShutdownHandlers } from "./server.js";

/**
 * Función principal de inicialización de la aplicación.
 * Orquesta el inicio del servidor y el registro de handlers de shutdown.
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
     * PASO 1: Inicia servidor HTTP y conexión a base de datos.
     * Si falla cualquiera de los dos, lanza excepción capturada abajo.
     * Retorna la instancia del servidor para inyección de dependencias.
     */
    const server = await startServer();

    /**
     * PASO 2: Registra handlers globales de shutdown.
     * Se ejecuta DESPUÉS del startup para garantizar que `server` exista.
     * Centraliza: señales del SO (SIGINT, SIGTERM) y errores fatales
     * (uncaughtException, unhandledRejection).
     */
    setupShutdownHandlers(server);

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
     * Durante el startup no hay recursos que liberar ordenadamente
     * (MongoDB ni HTTP están activos), por lo que process.exit directo es seguro.
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

/**
 * Bootstrap pattern (main) → Patrón donde una función central inicializa y orquesta el arranque completo de la aplicación.
 * Fail-fast → Filosofía de terminar el programa inmediatamente cuando ocurre un error crítico para evitar estados inconsistentes.
 * Centralized error handling → Todos los handlers de errores fatales comparten la misma lógica de shutdown graceful.
 * Graceful shutdown → Cierre controlado de la aplicación permitiendo liberar recursos, terminar conexiones y guardar logs antes de salir.
 * Separación startup/runtime → Diferenciar la lógica de inicialización de la aplicación de la lógica que ejecuta el servidor durante su vida útil.
 * Manejo seguro de async errors → Capturar y controlar errores provenientes de Promises y operaciones asíncronas para evitar fallos silenciosos.
 * Integración con Docker/PM2/Kubernetes → Diseñar el proceso para que herramientas de orquestación puedan detectar fallos y reiniciar automáticamente la app.
 * Uso correcto de stderr/stdout → Separar logs normales (stdout) de logs de error (stderr) para observabilidad y monitoreo profesional.
 * Defensive programming con unknown → Tratar valores externos o errores como tipos desconocidos hasta validarlos explícitamente para evitar fallos de tipo.
 * Single source of truth → La lógica de shutdown (HTTP + MongoDB) existe en un único lugar (gracefulShutdown en server.ts) y es reutilizada por todos los handlers.
 * Dependency injection → Inyectar la instancia del servidor HTTP desde main.ts hacia los handlers, desacoplando el arranque del manejo de señales.
 * Separation of concerns → main.ts orquesta; server.ts implementa el cierre y el registro de handlers sin mezclar responsabilidades.
 */