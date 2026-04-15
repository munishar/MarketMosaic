import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60000);

// Allow the process to exit without waiting for the interval
if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

export function rateLimit(windowMs?: number, maxRequests?: number) {
  if (config.nodeEnv === 'development') {
    return (_req: Request, _res: Response, next: NextFunction): void => next();
  }
  const window = windowMs ?? config.rateLimit.windowMs;
  const max = maxRequests ?? config.rateLimit.maxRequests;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + window });
      next();
      return;
    }

    entry.count++;
    if (entry.count > max) {
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
        },
      });
      return;
    }

    next();
  };
}

// Exported for testing cleanup
export function _clearStore(): void {
  store.clear();
}
