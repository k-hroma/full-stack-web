/**
 * @fileoverview Conector MongoDB con patrón Singleton.
 * Gestiona conexiones reutilizables para entornos serverless y tradicionales.
 * @module config/mongoDB
 */

import mongoose from 'mongoose';;
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
let isConnected:boolean = false;

/**
 * Establece conexión con MongoDB utilizando Mongoose.
 * Implementa reutilización de conexiones para optimizar recursos.
 * 
 * @async
 * @function connectMongoDB
 * @returns {Promise<ConnectResults>} Resultado de la operación de conexión
 * @throws {Error} Si MONGO_URI no está definida o la conexión falla
 * 
 * @example
 * const result = await connectMongoDB();
 * // { success: true, message: "MongoDB connected successfully" }
 */

const connectMongoDB = async (): Promise<ConnectResults> => {
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

    return { success: true, message: 'MongoDB connected successfully' };

  } catch (error: unknown) {
    isConnected = false; // Asegurar estado consistente en error
    const message = error instanceof Error ? error.message : 'Unknown connection error';
    
    throw new Error(`MongoDB connection failed: ${message}`);
  
  }
};

export { connectMongoDB };