/**
 * @fileoverview Middleware factory de autorización por roles (RBAC).
 * Permite configurar múltiples roles permitidos de forma declarativa.
 * @module middleware/requireRole
 */

import type { Request, Response, NextFunction } from "express";
import type { ErrorResults } from "../types/errorResults.js";
import { UserRole } from "../types/authInterface.js";

/**
 * Factory que crea middleware de autorización para roles específicos.
 * 
 * @function requireRole
 * @param {...UserRole[]} allowedRoles - Roles permitidos para acceder al recurso
 * @returns {(req: Request, res: Response<ErrorResult>, next: NextFunction) => void} Middleware configurado
 * 
 * @example
 * // Solo administradores
 * router.delete("/users", authMiddleware, requireRole("admin"), deleteUser);
 * 
 * @example
 * // Administradores o usuarios normales (cualquiera autenticado)
 * router.get("/profile", authMiddleware, requireRole("admin", "user"), getProfile);
 */

const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response<ErrorResults>, next: NextFunction): void => {
    
    // Verificación de autenticación previa
    if (!req.user) {
      console.error("[AUTHORIZATION] requireRole called without authentication");
      res.status(401).json({
        success: false,
        message: "Authentication required before authorization check",
      });
      return;
    }

    // Verificación de autorización
    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`[AUTHORIZATION DENIED] User ${req.user.email} with role "${req.user.role}" attempted to access resource requiring: [${allowedRoles.join(", ")}]`);
      res.status(403).json({
        success: false,
        message: `Access denied: requires ${allowedRoles.length === 1 ? "role" : "one of roles"} '${allowedRoles.join("' or '")}'`,
      });
      return;
    }

    // Autorización exitosa
    next();
  };
};

export { requireRole };