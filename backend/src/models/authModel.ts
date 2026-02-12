/**
 * @fileoverview Modelo Mongoose para el dominio de usuarios.
 * Gestiona persistencia de credenciales y roles en MongoDB.
 * @module models/authModel
 */

import { Schema, model } from "mongoose";
import type { IUser } from "../types/authInterface.js";

/**
 * Schema de Mongoose para documentos de usuario.
 * Define estructura, validaciones e índices de la colección "users".
 * 
 * @constant {Schema<IUser>} userSchema
 * 
 * @property {string} name - Nombre completo del usuario (requerido, trim)
 * @property {string} email - Correo único para login (requerido, índice único)npm run dev
 * 
 * @property {string} password - Hash bcrypt de contraseña (requerido, nunca retornar en queries)
 * @property {("admin" | "user")} role - Rol de permisos, default "user"
 * 
 * @options {object} schemaOptions
 * @property {boolean} versionKey:false - Desactiva campo __v de versión
 * @property {boolean} timestamps:true - Añade createdAt y updatedAt automáticamente
 */
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // No incluir password en queries por defecto (seguridad)
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "Role must be either 'admin' or 'user'",
      },
      default: "user",
    },
  },
  {
    versionKey: false, // Elimina campo __v
    timestamps: true, // Añade createdAt y updatedAt
    
    toJSON: {
      transform: (_doc, ret) => {
      const { password, ...user } = ret;
      return user;
  },
},
    toObject: {
      transform: (_doc, ret) => {
      const { password, ...user } = ret;
      return user;
  },
},
},
);

/**
 * Índice compuesto para búsquedas frecuentes por email.
 * Mejora performance de login.
 */
userSchema.index({ email: 1 });

/**
 * Modelo Mongoose para la colección "users".
 * Proporciona métodos de query (find, findOne, create, etc.).
 * 
 * @constant {Model<IUser>} User
 */

const User = model<IUser>("User", userSchema);

export { User };