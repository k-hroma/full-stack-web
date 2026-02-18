/**
 * @fileoverview Controladores para el dominio de autenticación.
 * Gestiona registro de usuarios, login y generación de tokens JWT.
 * @module controllers/authControllers
 */
import { v4 as uuidv4 } from "uuid";
import type { Request, Response, NextFunction } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/authModel.js";
import { RefreshToken } from "../models/refreshTokenModel.js";
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
 * Duración del Access Token (corto, va en memoria del frontend).
 *Access Token	JWT	Contiene datos del usuario (id, name, role) y expira rápido
*/
const ACCESS_TOKEN_EXPIRES_IN = "15m"; 

/**
 * Duración del Refresh Token (largo, va en httpOnly cookie) 7 días en segundos.
 * El refresh token es un string random largo que guardamos hasheado en la BD. Cuando llega, lo hasheamos y buscamos en la BD.
 */
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;
const REFRESH_TOKEN_EXPIRES_IN_MS = REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;

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
 * Autentica usuario existente y genera Access Token + Refresh Token.
 * 
 * @function loginUser
 * @async
 * @route POST /auth/login
 * @param {Request<{}, {}, loginUserBody>} req - Credenciales email/password
 * @param {Response<QueryResponse>} res - Respuesta con tokens y cookie
 * @param {NextFunction} next - Pasa errores a handleErrors
 * @returns {Promise<void>}
 * 
 * @error 400 - Datos de entrada inválidos
 * @error 401 - Credenciales incorrectas
 * @error 500 - Error de configuración JWT
 * @error 200 - Login exitoso con tokens
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

    // 2. Búsqueda de usuario (incluye password que por default en modelo select = false(seguridad))
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

   // 4. JWT_SECRET validado en startup (server.ts), TypeScript lo sabe por el tipo global
    const secretKey = process.env.JWT_SECRET!;

    // ==========================================
    // 5. GENERAR ACCESS TOKEN (JWT - 15 minutos)
    // ==========================================
    const accessPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(accessPayload, secretKey, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    // ==========================================
    // 6. GENERAR REFRESH TOKEN (UUID - 7 días)
    // ==========================================
    const tokenFamily = uuidv4();  // Identificador de sesion por eso no es necesario hashear
    const refreshTokenPlain = uuidv4(); // Token plano (solo existe en este momento)
    const refreshTokenHash = await bcryptjs.hash(refreshTokenPlain, SALT_ROUNDS); // se hashea para guardarla en la base de datos
    
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS); // al dia de la fecha + le suma 7 dias en milisegundos

    // Guardar en BD (el hash, no el token plano)
    await RefreshToken.create({
      userId: user._id, //Schema.Types.ObjectId,
      tokenHash: refreshTokenHash,
      tokenFamily: tokenFamily,
      expiresAt: expiresAt,
      ipAddress: req.ip || undefined, //Express lo detecta automáticamente de la conexión HTTP:
      userAgent: req.headers["user-agent"] || undefined, //El navegador del usuario lo manda automáticamente en cada request:
    });

    // ==========================================
    // 7. ENVIAR RESPUESTA
    // ==========================================
    
    
    // Refresh Token en httpOnly cookie (no accesible por JS)

    // res.cookie Es un método que agrega una cookie HTTP en la respuesta del servidor. 
    // El navegador la recibe y la guarda automáticamente. 
    // En cada request futuro, el navegador manda esa cookie de vuelta al servidor.
    // Nombre	"refreshToken"	El navegador la guarda con este nombre. La vemos en DevTools → Application → Cookies.
    // Valor	refreshTokenPlain	El UUID que generamos (ej: 550e8400-e29b-41d4-a716-446655440000).
    // Opciones	{...}	Configuración de seguridad y comportamiento.
    
    res.cookie("refreshToken", refreshTokenPlain, {
      httpOnly: true,        // No accesible por JavaScript (protege contra XSS -> ataques de inyeccion de scripts): document.cookie no muestra esta cookie.
      secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
      sameSite: "strict",    // Protege contra CSRF -> se manda la cookie Solo si el request viene del MISMO sitio (mismo dominio)
      maxAge: REFRESH_TOKEN_EXPIRES_IN_MS, // Cuánto tiempo el navegador guarda la cookie antes de borrarla automáticamente.
      path: "/auth/refresh", // Solo se envía a esta ruta -> No se manda innecesariamente en cada request a la API.
    });

    // Token Family en httpOnly cookie (para identificar la sesión, por eso no se hashea)
    res.cookie("tokenFamily", tokenFamily, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
      path: "/auth/refresh",
    });

    // Access Token en JSON (frontend lo guarda en memoria)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,    // Access token para el frontend
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    console.log(`[LOGIN SUCCESS] ${user.email} - Refresh token created`);

  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Renueva el Access Token usando un Refresh Token válido.
 * Implementa rotación: genera nuevo Refresh Token e invalida el anterior.
 * 
 * @function refreshAccessToken
 * @async
 * @route POST /auth/refresh
 * @access Public (pero requiere cookies válidas)
 * @cookie {string} refreshToken - Token de refresco en httpOnly cookie
 * @cookie {string} tokenFamily - Identificador de sesión en httpOnly cookie
 * @returns {Promise<void>}
 * 
 * @error 401 - Refresh token missing, invalid, expired or revoked
 * @error 200 - Nuevo access token generado
 */
const refreshAccessToken = async (
  req: Request,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // ==========================================
    // 1. OBTENER COOKIES
    // ==========================================
    const refreshTokenPlain = req.cookies.refreshToken; // req.cookies existe gracias al middleware cookie-parser en app.ts (cookie-parser lee el header HTTP: cuando llega una request y lo convierte en un objeto: req.cookies = { refreshToken: "abc123"})
    const tokenFamily = req.cookies.tokenFamily;

    if (!refreshTokenPlain || !tokenFamily) {
      res.status(401).json({
        success: false,
        message: "Refresh token and token family required",
      });
      return;
    }

    // ==========================================
    // 2. BUSCAR EN BD POR TOKEN FAMILY
    // ==========================================
    const refreshTokenDoc = await RefreshToken.findOne({
      tokenFamily: tokenFamily,  // ← Búsqueda por índice (rápida)
      revokedAt: null,           // No revocado
      expiresAt: { $gt: new Date() },  // No expirado
    });

    if (!refreshTokenDoc) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    // ==========================================
    // 3. VERIFICAR QUE EL HASH COINCIDA
    // ==========================================
    const isTokenValid = await bcryptjs.compare(
      refreshTokenPlain,
      refreshTokenDoc.tokenHash
    );

    if (!isTokenValid) {
      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
      return;
    }

    // ==========================================
    // 4. VERIFICAR QUE NO FUE REEMPLAZADO (ROTACIÓN)
    // ==========================================
    if (refreshTokenDoc.replacedByTokenHash) {
      // Posible robo: alguien usó un token que ya fue rotado
      res.status(401).json({
        success: false,
        message: "Token reuse detected. Please login again.",
      });
      return;
    }

    // ==========================================
    // 5. BUSCAR USUARIO
    // ==========================================
    const user = await User.findById(refreshTokenDoc.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // ==========================================
    // 6. VERIFICAR JWT_SECRET
    // ==========================================
    const secretKey = process.env.JWT_SECRET!;

    // ==========================================
    // 7. ROTACIÓN: GENERAR NUEVOS TOKENS
    // ==========================================
    const newRefreshTokenPlain = uuidv4();
    const newRefreshTokenHash = await bcryptjs.hash(newRefreshTokenPlain, SALT_ROUNDS);
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

    // Marcar el viejo como reemplazado
    refreshTokenDoc.replacedByTokenHash = newRefreshTokenHash;
    await refreshTokenDoc.save();

    // Crear el nuevo en BD (mismo tokenFamily, nuevo token)
    await RefreshToken.create({
      userId: user._id,
      tokenHash: newRefreshTokenHash,
      tokenFamily: tokenFamily,  // ← Mismo family, es la misma sesión
      expiresAt: newExpiresAt,
      ipAddress: req.ip || undefined,
      userAgent: req.headers["user-agent"] || undefined,
    });

    // ==========================================
    // 8. GENERAR NUEVO ACCESS TOKEN
    // ==========================================
    const accessPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = jwt.sign(accessPayload, secretKey, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    // ==========================================
    // 9. ENVIAR RESPUESTA CON NUEVA COOKIE
    // ==========================================


    // Nueva cookie de refresh token (reemplaza la vieja)
    res.cookie("refreshToken", newRefreshTokenPlain, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
      path: "/auth/refresh",
    });

    // Token family se mantiene igual (misma sesión)
    res.cookie("tokenFamily", tokenFamily, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
      path: "/auth/refresh",
    });

      res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newAccessToken,
    });

    console.log(`[TOKEN REFRESHED] ${user.email}`);

  } catch (error: unknown) {
    next(error);
  }
};

export { registerUser, registerAdmin, loginUser, refreshAccessToken };