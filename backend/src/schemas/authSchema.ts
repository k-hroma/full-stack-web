/**
 * @fileoverview Schemas Zod para validación de autenticación.
 * Define reglas de validación para registro y login de usuarios.
 * @module schemas/authSchema
 */

import { z } from "zod";

/**
 * Schema de validación para registro de nuevos usuarios.
 * Incluye reglas de seguridad para contraseñas robustas.
 * 
 * @constant {z.ZodObject} RegisterUserSchema
 * @property {z.ZodString} name - Nombre no vacío, mínimo 1 carácter
 * @property {z.ZodString} email - Email válido según RFC 5322
 * @property {z.ZodString} password - Mínimo 6 chars, mayúscula, número, especial, sin espacios
 * 
 * @security
 * - Requiere complejidad de contraseña para prevenir ataques de fuerza bruta
 * - Trim automático en strings para evitar espacios accidentales
 * - Strict mode: rechaza propiedades no definidas (protección contra injection)
 */
const RegisterUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es obligatorio" })
    .trim(),

  email: z
    .email({ message: "El email ingresado no es válido." })
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." })
    .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula." })
    .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número." })
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
      message: "La contraseña debe contener al menos un carácter especial.",
    })
    .regex(/^\S*$/, { message: "La contraseña no debe contener espacios." }),
}).strict();


/**
 * Tipo inferido del schema de registro.
 * Usado para tipar el body de requests POST /auth/register.
 * 
 * @typedef {z.infer<typeof RegisterUserSchema>} registerUserBody
 */

type registerUserBody = z.infer<typeof RegisterUserSchema>;

/**
 * Schema de validación para inicio de sesión.
 * Requisitos mínimos: email válido y contraseña no vacía.
 * 
 * @constant {z.ZodObject} LoginUserSchema
 * @note La validación de contraseña es mínima porque se verifica contra hash en BD
 */

const LoginUserSchema = z.object({
  email: z
    .email({ message: "Debe ser un email válido" })
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(1, { message: "La contraseña es obligatoria" }),
}).strict();



/**
 * Tipo inferido del schema de login.
 * Usado para tipar el body de requests POST /auth/login.
 * 
 * @typedef {z.infer<typeof LoginUserSchema>} loginUserBody
 */
type loginUserBody = z.infer<typeof LoginUserSchema>;

export { 
  RegisterUserSchema, 
  LoginUserSchema 
};

export type { 
  registerUserBody, 
  loginUserBody 
};
