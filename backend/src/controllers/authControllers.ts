/**
 * @fileoverview Controladores para el dominio de autenticación.
 * Gestiona registro de usuarios, login y generación de tokens JWT.
 * @module controllers/authControllers
 */

import type { Request, Response, NextFunction } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/authModel.js";
import type { QueryResponse } from "../types/queryResponse.js";
import type {
  registerUserBody,
  loginUserBody,
} from "../schemas/authSchema.js";
import {
  RegisterUserSchema,
  LoginUserSchema,
} from "../schemas/authSchema.js";

/**
 * Cost factor para bcrypt (número de rondas de hashing).
 * 10 = ~100ms en hardware moderno (balance seguridad/performance).
 * 
 * @constant {number} SALT_ROUNDS
 */
const SALT_ROUNDS = 10;

/**
 * Registra un nuevo usuario con rol "user" (cliente).
 * 
 * @function registerUser
 * @async
 * @route POST /auth/register
 * @param {Request<{}, {}, registerUserBody>} req - Body validado con RegisterUserSchema
 * @param {Response<QueryResponse>} res - Respuesta estandarizada
 * @param {NextFunction} next - Pasa errores inesperados a handleErrors
 * @returns {Promise<void>}
 * 
 * @error 400 - Datos de entrada inválidos (validación Zod)
 * @error 409 - Email ya registrado (duplicado)
 * @error 201 - Usuario creado exitosamente
 */
const registerUser = async (
  req: Request<{}, {}, registerUserBody>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Validación de entrada con Zod
    //safeParse retorna { success: boolean, data/error } → más limpio para APIs
    const parseResult = RegisterUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map(
        (issue) => issue.message
      );
      
      res.status(400).json({
        success: false,
        message: "Invalid registration data",
        error: { issues: errorMessages },
      });
      return;
    }
    // 2. destructuracion
    const { name, email, password } = parseResult.data;
    // 3. Hash de contraseña con bcrypt
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

    // 4. Creación de usuario en BD
    const newUser = await User.create({
      name,
      email, // mongoose lo convierte a lowercase+trim automaticamente
      password: hashedPassword,
      role: "user",
    });

    // 5. Respuesta exitosa (sin password por select: false en modelo)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id.toString(), //Convierte ObjectId de MongoDB a string
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

    console.log(`[USER REGISTERED] ${newUser.email}`);

  } catch (error: unknown) {
    // Manejo específico de error de duplicado (race condition)
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({
        success: false,
        message: "Email already registered (duplicate key)",
      });
      return;
    }
    next(error);
  }
};

/**
 * Registra un nuevo usuario con rol "admin".
 * Requiere que el endpoint esté protegido por middleware de admin.
 * 
 * @function registerAdmin
 * @async
 * @route POST /auth/admin
 * @param {Request<{}, {}, registerUserBody>} req - Body con datos de admin
 * @param {Response<QueryResponse>} res - Respuesta estandarizada
 * @param {NextFunction} next - Pasa errores a handleErrors
 * @returns {Promise<void>}
 * 
 * @prerequisite Middleware de autenticación y rol admin debe ejecutarse antes
 */
const registerAdmin = async (
  req: Request<{}, {}, registerUserBody>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = RegisterUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid admin registration data",
        error: parseResult.error,
      });
      return;
    }

    const { name, email, password } = parseResult.data;
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        id: newAdmin._id.toString(),
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });

    console.log(`[ADMIN REGISTERED] ${newAdmin.email}`);

  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({
        success: false,
        message: "Email already registered",
      });
      return;
    }
    next(error);
  }
};

/**
 * Autentica usuario existente y genera token JWT.
 * 
 * @function loginUser
 * @async
 * @route POST /auth/login
 * @param {Request<{}, {}, loginUserBody>} req - Credenciales email/password
 * @param {Response<QueryResponse>} res - Respuesta con token JWT
 * @param {NextFunction} next - Pasa errores a handleErrors
 * @returns {Promise<void>}
 * 
 * @error 400 - Datos de entrada inválidos
 * @error 401 - Credenciales incorrectas (usuario no existe o password inválido)
 * @error 500 - Error de configuración (JWT_SECRET no definido)
 * @error 200 - Login exitoso con token
 */
const loginUser = async (
  req: Request<{}, {}, loginUserBody>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Validación de entrada
    const parseResult = LoginUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid login data",
        error: parseResult.error,
      });
      return;
    }

    const { email, password } = parseResult.data;

    // 2. Búsqueda de usuario (incluye password porque select:false por defecto)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // 3. Verificación de contraseña
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // 4. Verificación de configuración JWT
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error("[LOGIN ERROR] JWT_SECRET not configured");
      res.status(500).json({
        success: false,
        message: "Authentication service unavailable",
      });
      return;
    }

    // 5. Generación de token JWT
    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, secretKey);

    // 6. Respuesta exitosa
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    console.log(`[LOGIN SUCCESS] ${user.email}`);

  } catch (error: unknown) {
    next(error);
  }
};

export { registerUser, registerAdmin, loginUser };