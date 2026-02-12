/**
 * @fileoverview Payload JWT y extensión de tipos de Express.
 * Define la estructura del token JWT y extiende Request de Express.
 * @module types/authPayload
 */

/**
 * Payload del token JWT.
 * Contiene claims estándar y custom para identificación del usuario.
 * 
 * @interface AuthPayload
 * @property {string} id - ID del usuario (subject del JWT)
 * @property {string} name - Nombre para display rápido
 * @property {string} email - Email para contacto/verificación
 * @property {"user" | "admin"} role - Rol para autorización RBAC
 */
interface AuthPayload {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

/**
 * Extensión del namespace Express para añadir propiedad `user` al Request.
 * Permite acceso tipado a `req.user` después de la autenticación JWT.
 * 
 * @declaration Augmentación de módulo para TypeScript
 */
declare global {
  namespace Express {
    /**
     * Interfaz Request extendida con datos de usuario autenticado.
     * @interface Request
     * @property {AuthPayload} [user] - Datos del JWT verificado (opcional antes de auth)
     */
    interface Request {
      user?: AuthPayload;
    }
  }
}

export type { AuthPayload };