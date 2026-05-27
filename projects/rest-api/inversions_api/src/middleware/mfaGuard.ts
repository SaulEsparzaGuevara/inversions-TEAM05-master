import type { NextFunction, Request, Response } from "express";

const sensitiveRoles = new Set(["trader", "admin"]);

export function mfaGuard(req: Request, res: Response, next: NextFunction): void {
  const context = req.authContext;

  if (!context) {
    res.status(401).json({ code: "AUTH_CONTEXT_MISSING" });
    return;
  }

  if (!sensitiveRoles.has(context.role)) {
    next();
    return;
  }

  if (!context.mfaSessionId) {
    res.status(403).json({ code: "AUTH_CONTEXT_MFA_REQUIRED" });
    return;
  }

  next();
}
