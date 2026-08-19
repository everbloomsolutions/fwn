/**
 * Rate limiting middleware
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { isDevelopment } from '../config';

// Time constants
const ONE_MINUTE_MS = 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;

// Check if running in test environment
const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

/**
 * Create a rate limiter with consistent error response format
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  const errorMessage = options.message ?? 'Too many requests from this IP, please try again later.';

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: errorMessage,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          message: errorMessage,
          statusCode: 429,
        },
      });
    },
  });
};

/**
 * Contact form rate limiter
 * Limits: 5 submissions per 15 minutes per IP (or 10000 in test/dev)
 */
export const contactFormRateLimiter = createRateLimiter({
  windowMs: isTest ? 1000 : FIFTEEN_MINUTES_MS, // Shorter window in test
  max: isTest || isDevelopment ? 10000 : 5,
  message: 'Too many contact form submissions. Please try again in 15 minutes.',
  skipSuccessfulRequests: false,
});

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 100,
  message: 'Too many requests. Please try again later.',
});

/**
 * Auth rate limiter for login/register
 * Limits: 10 attempts per 15 minutes per IP (or 10000 in test/dev)
 */
export const authRateLimiter = createRateLimiter({
  windowMs: isTest ? 1000 : FIFTEEN_MINUTES_MS, // Shorter window in test
  max: isTest || isDevelopment ? 10000 : 10,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  skipSuccessfulRequests: true,
});

/**
 * Strict auth rate limiter for sensitive operations
 * Limits: 5 attempts per 15 minutes per IP
 */
export const strictAuthRateLimiter = createRateLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 5,
  message: 'Too many attempts. Please try again later.',
  skipSuccessfulRequests: false,
});

