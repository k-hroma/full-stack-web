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

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const JWT_ALGORITHM = "HS256" as const;
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;
const REFRESH_TOKEN_EXPIRES_IN_MS = REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;

/**
 * Helper para logs de auditoría de seguridad (sin PII).
 * 
 * @security NUNCA loguear emails, nombres o datos personales. 
 * Solo userId (hash anónimo), IP, User-Agent y timestamp.
 * En producción, estos logs van a stdout para ser capturados por ELK/Datadog.
 * 
 * @function auditLog
 * @param {string} action - Acción realizada (LOGIN, LOGOUT, etc)
 * @param {string} userId - ID del usuario (ObjectId string)
 * @param {Request} req - Request para extraer IP y User-Agent
 */
const auditLog = (action: string, userId: string, req: Request): void => {
  console.log(`[AUDIT] ${action}`, {
    userId,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    timestamp: new Date().toISOString(),
  });
};

const registerUser = async (
  req: Request<{}, {}, registerUserBody>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
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

    const { name, email, password } = parseResult.data;
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

    auditLog("USER_REGISTERED", newUser._id.toString(), req);

  } catch (error: unknown) {
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

    auditLog("ADMIN_REGISTERED", newAdmin._id.toString(), req);

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

const loginUser = async (
  req: Request<{}, {}, loginUserBody>,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
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

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const secretKey = process.env.JWT_SECRET!;

    const accessPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(accessPayload, secretKey, {
      algorithm: "HS256",
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    const tokenFamily = uuidv4();
    const refreshTokenPlain = uuidv4();
    const refreshTokenHash = await bcryptjs.hash(refreshTokenPlain, SALT_ROUNDS);
    
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      tokenFamily: tokenFamily,
      expiresAt: expiresAt,
      ipAddress: req.ip || undefined,
      userAgent: req.headers["user-agent"] || undefined,
    });

    res.cookie("refreshToken", refreshTokenPlain, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
      path: "/auth/refresh",
    });

    res.cookie("tokenFamily", tokenFamily, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
      path: "/auth/refresh",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    auditLog("LOGIN_SUCCESS", user._id.toString(), req);

  } catch (error: unknown) {
    next(error);
  }
};

const refreshAccessToken = async (
  req: Request,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshTokenPlain = req.cookies.refreshToken;
    const tokenFamily = req.cookies.tokenFamily;

    if (!refreshTokenPlain || !tokenFamily) {
      res.status(401).json({
        success: false,
        message: "Refresh token and token family required",
      });
      return;
    }

    const refreshTokenDoc = await RefreshToken.findOne({
      tokenFamily: tokenFamily,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!refreshTokenDoc) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

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

    if (refreshTokenDoc.replacedByTokenHash) {
      await RefreshToken.updateMany(
        { tokenFamily: tokenFamily, revokedAt: null },
        { revokedAt: new Date() }
      );
      
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        path: "/auth/refresh",
      });
      
      res.clearCookie("tokenFamily", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        path: "/auth/refresh",
      });
      
      auditLog("TOKEN_REUSE_DETECTED", refreshTokenDoc.userId.toString(), req);
      
      res.status(401).json({
        success: false,
        message: "Security violation detected. All sessions terminated.",
      });
      return;
    }

    const user = await User.findById(refreshTokenDoc.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const secretKey = process.env.JWT_SECRET!;

    const newRefreshTokenPlain = uuidv4();
    const newRefreshTokenHash = await bcryptjs.hash(newRefreshTokenPlain, SALT_ROUNDS);
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

    refreshTokenDoc.replacedByTokenHash = newRefreshTokenHash;
    refreshTokenDoc.revokedAt = new Date();
    await refreshTokenDoc.save();

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newRefreshTokenHash,
      tokenFamily: tokenFamily,
      expiresAt: newExpiresAt,
      ipAddress: req.ip || undefined,
      userAgent: req.headers["user-agent"] || undefined,
    });

    const accessPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = jwt.sign(accessPayload, secretKey, {
      algorithm: JWT_ALGORITHM,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    res.cookie("refreshToken", newRefreshTokenPlain, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
      path: "/auth/refresh",
    });

    res.cookie("tokenFamily", tokenFamily, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
      path: "/auth/refresh",
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newAccessToken,
    });

    auditLog("TOKEN_REFRESHED", user._id.toString(), req);

  } catch (error: unknown) {
    next(error);
  }
};

const logoutUser = async (
  req: Request,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshTokenPlain = req.cookies.refreshToken;
    const tokenFamily = req.cookies.tokenFamily;

    if (refreshTokenPlain && tokenFamily) {
      const refreshTokenDoc = await RefreshToken.findOne({
        tokenFamily: tokenFamily,
        revokedAt: null,
      }).sort({ createdAt: -1 });

      if (refreshTokenDoc) {
        const isTokenValid = await bcryptjs.compare(
          refreshTokenPlain,
          refreshTokenDoc.tokenHash
        );

        if (isTokenValid) {
          refreshTokenDoc.revokedAt = new Date();
          await refreshTokenDoc.save();
          
          auditLog("LOGOUT", refreshTokenDoc.userId.toString(), req);
        }
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/auth/refresh",
    });

    res.clearCookie("tokenFamily", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/auth/refresh",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error: unknown) {
    next(error);
  }
};

const logoutAllDevices = async (
  req: Request,
  res: Response<QueryResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const targetUserId = req.body.userId || req.user!.id;
    
    if (req.user!.role !== "admin" && targetUserId !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: "Can only logout your own sessions",
      });
      return;
    }

    const result = await RefreshToken.updateMany(
      { userId: targetUserId, revokedAt: null },
      { revokedAt: new Date() }
    );

    auditLog("LOGOUT_ALL_DEVICES", targetUserId, req);

    res.status(200).json({
      success: true,
      message: `Logged out from ${result.modifiedCount} device(s)`,
    });

  } catch (error: unknown) {
    next(error);
  }
};

export { registerUser, registerAdmin, loginUser, refreshAccessToken, logoutUser, logoutAllDevices };