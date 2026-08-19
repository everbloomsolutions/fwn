import { Request, Response, NextFunction } from 'express';
import { sanitizeObject, sanitizeString } from '../utils/sanitize';

/**
 * Middleware to sanitize request body, query, and params
 */
export const sanitizeMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery: Record<string, unknown> = {};
    for (const key in req.query) {
      const value = req.query[key];
      if (typeof value === 'string') {
        sanitizedQuery[key] = sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitizedQuery[key] = value.map((item) =>
          typeof item === 'string' ? sanitizeString(item) : item
        );
      } else {
        sanitizedQuery[key] = value;
      }
    }
    req.query = sanitizedQuery as typeof req.query;
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    const sanitizedParams: Record<string, string> = {};
    for (const key in req.params) {
      sanitizedParams[key] = sanitizeString(req.params[key]);
    }
    req.params = sanitizedParams;
  }

  next();
};

