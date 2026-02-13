/**
 * @fileoverview Interfaces de dominio para el módulo de autenticación.
 * Define la estructura de datos de usuarios en el sistema.
 * @module types/authInterface
*/

/**
 * Representa un usuario completo en la base de datos.
 * Incluye credenciales y metadatos de rol.
 * 
 * @interface IUser
 * @property {string} name - Nombre completo del usuario (requerido)
 * @property {string} email - Correo electrónico único (requerido)
 * @property {string} password - Contraseña hasheada con bcrypt (requerido)
 * @property {"admin" | "user"} role - Rol de permisos en el sistema
*/

type UserRole = "admin" | "user";


interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Datos públicos de un usuario registrado.
 * Excluye información sensible como la contraseña.
 * Ideal para respuestas de API.
 * 
 * @interface IRegisterUser
 * @property {string} id - Identificador único MongoDB (stringified ObjectId)
 * @property {string} name - Nombre del usuario
 * @property {string} email - Correo electrónico
 * @property {"admin" | "user"} role - Rol asignado
 */


interface IRegisterUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}


export type { IUser, IRegisterUser, UserRole };