/**
 * @fileoverview Conector MongoDB con patrón Singleton y reintentos.
 * Gestiona conexiones reutilizables para entornos serverless y tradicionales.
 * @module config/mongoDB
 */

import mongoose from 'mongoose';
import type { ConnectResults } from '../types/connectionResults.js';

/**
 * URI de conexión a MongoDB desde variables de entorno.
 * 
 * @constant {string | undefined} MONGO_URI
 */
const MONGO_URI = process.env.MONGO_URI;

/**
 * Estado de conexión global (patrón Singleton).
 * Evita reconexiones innecesarias en entornos serverless (Vercel, AWS Lambda).
 * 
 * @type {boolean}
 */
let isConnected: boolean = false;

/**
 * Configuración de reintentos de conexión.
 * Útil en entornos Docker Compose donde MongoDB puede tardar en iniciar.
 * 
 * @constant {Object} RETRY_CONFIG
 */
const RETRY_CONFIG = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  factor: 2 // Multiplicador exponencial
};

/**
 * Establece conexión con MongoDB utilizando Mongoose.
 * Implementa reutilización de conexiones y lógica de reintentos exponenciales.
 * 
 * @async
 * @function connectMongoDB
 * @param {number} [retryCount=0] - Contador interno de reintentos (uso recursivo)
 * @returns {Promise<ConnectResults>} Resultado de la operación de conexión
 * @throws {Error} Si MONGO_URI no está definida o se agotan los reintentos
 * 
 * @example
 * const result = await connectMongoDB();
 * // { success: true, message: "MongoDB connected successfully" }
 */
const connectMongoDB = async (retryCount = 0): Promise<ConnectResults> => {
  // Validación de configuración crítica
  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is required');
  }

  /**
   * Retorno temprano si ya existe conexión activa.
   * Crítico para serverless: evita crear múltiples conexiones por request.
   */
  if (isConnected) {
    console.info('📦 Using existing MongoDB connection');
    return { success: true, message: 'Using existing connection' };
  }

  try {
    /**
     * Configuración de conexión Mongoose.
     * 
     * @param {number} serverSelectionTimeoutMS - Tiempo máximo para seleccionar servidor (5s)
     * @param {number} maxPoolSize - Conexiones simultáneas máximas en el pool
     */
    const connection = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      bufferCommands: false, // Desactiva buffering de comandos cuando no hay conexión
    });

    /**
     * Verificación de estado de conexión.
     * readyState 1 = connected (enum ConnectionStates.connected)
     */
    if (connection.connection.readyState !== 1) {
      throw new Error('MongoDB connection established but not ready');
    }

    // Marcar como conectado globalmente
    isConnected = true;

    /**
     * Event listeners para monitoreo de conexión.
     * Permiten detectar desconexiones y reconexiones automáticas.
     */
    connection.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ MongoDB disconnected');
    });

    connection.connection.on('reconnected', () => {
      isConnected = true;
      console.info('✅ MongoDB reconnected');
    });

    connection.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error.message);
    });

    return { success: true, message: 'MongoDB connected successfully' };

  } catch (error: unknown) {
    isConnected = false;
    
    const message = error instanceof Error ? error.message : 'Unknown connection error';
    
    /**
     * Lógica de reintento exponencial.
     * Útil cuando MongoDB aún no está listo (ej: Docker Compose).
     */
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delay = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.factor, retryCount),
        RETRY_CONFIG.maxDelayMs
      );
      
      console.warn(`⚠️ MongoDB connection failed (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries}): ${message}`);
      console.warn(`🔄 Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectMongoDB(retryCount + 1);
    }
    
    throw new Error(`MongoDB connection failed after ${RETRY_CONFIG.maxRetries} attempts: ${message}`);
  }
};

export { connectMongoDB };