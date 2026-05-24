import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "./authContext.js";

export function requireRole(...roles: UserRole[]) {
  const allowed = new Set(roles);

  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.authContext?.role;

    if (!role) {
      res.status(401).json({ code: "AUTH_CONTEXT_MISSING" });
      return;
    }

    if (!allowed.has(role)) {
      res.status(403).json({ code: "AUTH_CONTEXT_FORBIDDEN_ROLE", role });
      return;
    }

    next();
  };
}
