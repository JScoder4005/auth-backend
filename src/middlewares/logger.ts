import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 * Logs incoming requests with method, path, and timestamp
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.socket.remoteAddress;

  // Log the request
  console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);

  // Capture response time
  const startTime = Date.now();

  // Intercept response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Color code based on status
    const statusColor = 
      statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
      statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
      statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
      statusCode >= 200 ? '\x1b[32m' : // Green for 2xx
      '\x1b[0m'; // Default

    console.log(
      `${statusColor}[${timestamp}] ${method} ${path} - ${statusCode} - ${duration}ms\x1b[0m`
    );
  });

  next();
};
