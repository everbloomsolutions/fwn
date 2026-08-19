import compression from 'compression';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { isProduction } from '../config';

/**
 * Compression middleware
 * Compresses response bodies for all requests that traverse through the middleware
 */
export const compressionMiddleware: RequestHandler = compression({
  // Only compress responses if the request accepts compression
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      // Don't compress responses if this request header is present
      return false;
    }

    // Use compression filter function
    return compression.filter(req, res);
  },
  // Compression level (0-9, where 9 is maximum compression)
  level: isProduction ? 6 : 1, // Higher compression in production
  // Threshold: only compress responses above this size (in bytes)
  threshold: 1024, // 1KB
});

/**
 * Conditional compression - only in production
 */
export const conditionalCompression = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (isProduction) {
    return compressionMiddleware(req, res, next);
  }
  next();
};
