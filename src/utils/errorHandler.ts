import { Request, Response, NextFunction } from 'express';

/**
 * Async error handler wrapper
 * Eliminates try-catch boilerplate in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Centralized error handler middleware
 * Place this at the end of all routes
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      message: 'Resource already exists',
      field: err.meta?.target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      message: 'Resource not found',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Custom error class
 */
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
