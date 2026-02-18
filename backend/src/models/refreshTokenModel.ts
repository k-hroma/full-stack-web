/**
 * @fileoverview Modelo Mongoose para Refresh Tokens.
 * Gestiona persistencia de tokens de refresco con rotación y revocación.
 * @module models/refreshTokenModel
 */

import { Schema, model } from "mongoose";
import type { IRefreshToken } from "../types/refreshTokenInterface.js";

/**
 * Schema de Mongoose para documentos de refresh token.
 * 
 * @constant {Schema<IRefreshToken>} refreshTokenSchema
 */
const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true, // Para buscar rápido todos los tokens de un usuario rápido (para "logout de todos los dispositivos")
    },
    tokenHash: {
      type: String,
      required: [true, "Token hash is required"],
      unique: true, // Nunca debe haber dos tokens con el mismo hash
      index: true,  // Para buscar rápido al validar
    },
    tokenFamily: {  
      type: String,
      required: [true, "Token family is required"],
      index: true,  // Índice para búsqueda rápida por sesión
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedByTokenHash: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true, // createdAt, updatedAt
  }
);


/*
userId: para saber a quién pertenece y poder hacer "logout de todos los dispositivos"
tokenHash: guardamos el hash, no el token plano (igual que contraseñas)
tokenFamily: UUID que identifica la sesión, permite buscar rápido sin comparar hashes
expiresAt: para limpiar tokens viejos automáticamente
revokedAt: para logout manual (invalidar un token específico)
replacedByTokenHash: para rotación (cuando usás un refresh token, se genera uno nuevo y el viejo queda marcado como reemplazado)
ipAddress/userAgent: opcional, para que el usuario vea "sesiones activas" tipo Google
*/

/**
 * Índice TTL (Time To Live) para eliminar automáticamente tokens expirados.
 * MongoDB corre un job cada 60 segundos que borra documentos donde expiresAt < ahora.
 */
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 } // TTL (Time To Live)	MongoDB borra automáticamente los tokens vencidos. No ocupamos espacio innecesario.
);

/**
 * Modelo Mongoose para la colección "refreshTokens".
 * 
 * @constant {Model<IRefreshToken>} RefreshToken
 */
const RefreshToken = model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export { RefreshToken };