import type { NextFunction, Request, Response } from "express";

interface RateLimitState {
  windowStart: number;
  count: number;
  cooldownUntil?: number;
}

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  cooldownSeconds: number;
}

const defaultOptions: RateLimitOptions = {
  windowSeconds: 60,
  maxRequests: 10,
  cooldownSeconds: 120
};

const state = new Map<string, RateLimitState>();

export function createSensitiveRateLimit(options: Partial<RateLimitOptions> = {}) {
  const resolved = { ...defaultOptions, ...options };
  const windowMs = resolved.windowSeconds * 1000;
  const cooldownMs = resolved.cooldownSeconds * 1000;

  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = req.authContext?.userId;
    const route = req.route?.path ?? req.path;

    if (!userId) {
      res.status(401).json({ code: "AUTH_CONTEXT_MISSING" });
      return;
    }

    const key = `${userId}:${route}`;
    const now = Date.now();
    const current = state.get(key);

    if (current?.cooldownUntil && current.cooldownUntil > now) {
      const retryAfterSeconds = Math.ceil((current.cooldownUntil - now) / 1000);
      res.status(429).json({ code: "RATE_LIMITED", retryAfterSeconds });
      return;
    }

    if (!current || now - current.windowStart > windowMs) {
      state.set(key, { windowStart: now, count: 1 });
      next();
      return;
    }

    current.count += 1;

    if (current.count > resolved.maxRequests) {
      current.cooldownUntil = now + cooldownMs;
      res.status(429).json({ code: "RATE_LIMITED", retryAfterSeconds: resolved.cooldownSeconds });
      return;
    }

    state.set(key, current);
    next();
  };
}
