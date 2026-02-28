/**
 * Tipos de autenticación - Mapeo 1:1 con backend
 * @module types/auth
 */

/** Rol de usuario - coincide con UserRole del backend */
export type UserRole = "admin" | "user";

/** Payload del JWT - coincide con AuthPayload del backend */
export interface AuthPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/** Usuario registrado (respuesta de login/register) - coincide con IRegisterUser */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/** Body de login - coincide con loginUserBody del backend */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Body de registro - coincide con registerUserBody del backend */
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

/** Respuesta exitosa de login - coincide con QueryResponse del backend */
export interface LoginResponse {
  success: true;
  message: string;
  token: string;        // Access JWT
  data: User;
}

/** Respuesta de refresh token */
export interface RefreshResponse {
  success: true;
  message: string;
  token: string;        // Nuevo access JWT
}

/** Respuesta de error estándar - coincide con ErrorResults del backend */
export interface ApiError {
  success: false;
  message: string;
  errorCode?: number | string;
  error?: unknown;
}