import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiting implementation
 * Note: For production, consider using Redis-backed solutions
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup function to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000); // Cleanup every minute

const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (store[key].count >= max) {
      return res.status(429).json({
        message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }

    store[key].count++;
    next();
  };
};

/**
 * Rate limiting middleware configurations
 */

// General API rate limiter
export const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for authentication endpoints
export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts, please try again later.'
);

// Moderate limiter for expense operations
export const expenseLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  30, // 30 requests per window
  'Too many requests, please slow down.'
);

