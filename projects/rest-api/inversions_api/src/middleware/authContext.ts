/**
 * FIC: Authentication context middleware for JWT claim verification and RLS enforcement.
 * Extracts JWT token from request headers, validates claims, and ensures RLS policies are applied.
 * 
 * FIC: Middleware de contexto de autenticación para verificación de claims JWT y aplicación de RLS.
 * Extrae token JWT de headers de solicitud, valida claims y asegura que políticas RLS se apliquen.
 * 
 * Constraint: RLS policies MUST be defined in Supabase at the table level.
 * This middleware provides the JWT token to Supabase, and Supabase RLS enforces the actual restrictions.
 * Do NOT duplicate authorization logic here; all row-level filtering must happen in the database.
 * 
 * Restricción: Las políticas RLS DEBEN definirse en Supabase a nivel de tabla.
 * Este middleware proporciona el token JWT a Supabase, y RLS de Supabase aplica las restricciones reales.
 * NO duplicar lógica de autorización aquí; todo el filtrado de nivel de fila debe ocurrir en la base de datos.
 */

import type { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { getEnvironmentConfig } from "../config/environment.js";

export type UserRole = "viewer" | "trader" | "admin" | "service_role";

export interface AuthContext {
  userId: string;
  email?: string;
  role: UserRole;
  mfaSessionId?: string;
  token?: string;
}

interface TokenClaims {
  sub?: string;
  email?: string;
  role?: UserRole;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext;
    }
  }
}

function isValidRole(role: string | undefined): role is UserRole {
  return (
    role === "viewer" ||
    role === "trader" ||
    role === "admin" ||
    role === "authenticated" ||
    role === "service_role"
  );
}

export function authContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const authBypass = process.env.AUTH_BYPASS;
  const shouldBypassAuth = authBypass === "true" || (authBypass == null && nodeEnv === "development");

  if (shouldBypassAuth) {
    req.authContext = {
      userId: process.env.AUTH_BYPASS_USER_ID ?? "dev-user",
      email: process.env.AUTH_BYPASS_EMAIL ?? "dev@local",
      role: (process.env.AUTH_BYPASS_ROLE as UserRole) ?? "trader",
      mfaSessionId: req.header("x-mfa-session-id") ?? "dev-mfa-session",
      token: process.env.AUTH_BYPASS_TOKEN ?? "dev-bypass-token"
    };
    next();
    return;
  }

  const authorization = req.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ code: "AUTH_CONTEXT_MISSING" });
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    const config = getEnvironmentConfig();
    const decoded = verify(token, config.jwt.secret, {
      algorithms: ["HS256"],
    }) as TokenClaims;

    if (!decoded.sub || !isValidRole(decoded.role)) {
      res.status(401).json({ code: "AUTH_CONTEXT_INVALID_TOKEN" });
      return;
    }

    req.authContext = {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role as UserRole,
      mfaSessionId: req.header("x-mfa-session-id") ?? undefined,
      token,
    };
    next();
  } catch {
    res.status(401).json({ code: "AUTH_CONTEXT_INVALID_TOKEN" });
  }
}
