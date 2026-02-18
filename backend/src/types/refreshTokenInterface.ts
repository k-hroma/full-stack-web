/**
 * @fileoverview Interface para el modelo de Refresh Tokens.
 * Define la estructura de tokens de refresco en la BD.
 * @module types/refreshTokenInterface
 */

import type { Types } from "mongoose";

/**
 * Representa un refresh token almacenado en la base de datos.
 * 
 * @interface IRefreshToken
 * @property {Types.ObjectId} userId - Referencia al usuario propietario
 * @property {string} tokenHash - Hash bcrypt del token (nunca el token plano)
 * @property {string} tokenFamily - UUID que identifica la sesión del usuario
 * @property {Date} expiresAt - Fecha de expiración del token
 * @property {Date} [revokedAt] - Fecha de revocación (si fue invalidado manualmente)
 * @property {string} [replacedByTokenHash] - Hash del token que lo reemplazó (rotación)
 * @property {string} [ipAddress] - IP desde donde se creó (auditoría opcional)
 * @property {string} [userAgent] - Navegador/dispositivo (auditoría opcional)
 */
interface IRefreshToken {
  userId: Types.ObjectId;
  tokenHash: string;
  tokenFamily: string; //Identificador de sesión para búsqueda rápida
  expiresAt: Date;
  revokedAt?: Date;
  replacedByTokenHash?: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export type { IRefreshToken };