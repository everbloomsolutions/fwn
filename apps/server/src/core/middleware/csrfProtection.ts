import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/errorHandler';
import { isProduction } from '../config';
import { getRedisClient, isRedisConnected } from '../config/redis';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 * 
 * For API-only applications using JWT tokens in Authorization headers, CSRF protection
 * is less critical since JWT tokens are not automatically sent with requests like cookies.
 * However, this middleware provides additional protection for state-changing operations.
 * 
 * Implementation:
 * - Generates and stores CSRF tokens in Redis (or in-memory fallback)
 * - Validates tokens for POST, PUT, PATCH, DELETE requests
 * - Tokens are tied to user sessions and expire after 1 hour
 */
const tokenStore = new Map<string, { token: string; expiresAt: number }>();

const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const storeToken = async (userId: string, token: string): Promise<void> => {
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  
  if (isRedisConnected()) {
    const redis = getRedisClient();
    if (redis) {
      await redis.setEx(`csrf:${userId}`, 3600, token);
      return;
    }
  }
  
  // Fallback to in-memory store
  tokenStore.set(userId, { token, expiresAt });
  
  // Clean up expired tokens
  for (const [key, value] of tokenStore.entries()) {
    if (value.expiresAt < Date.now()) {
      tokenStore.delete(key);
    }
  }
};

const validateToken = async (userId: string, token: string): Promise<boolean> => {
  if (isRedisConnected()) {
    const redis = getRedisClient();
    if (redis) {
      const storedToken = await redis.get(`csrf:${userId}`);
      return storedToken === token;
    }
  }
  
  // Fallback to in-memory store
  const stored = tokenStore.get(userId);
  if (!stored || stored.expiresAt < Date.now()) {
    tokenStore.delete(userId);
    return false;
  }
  
  return stored.token === token;
};

export const csrfProtection = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for public endpoints that don't require authentication
  const publicPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/contact'];
  if (publicPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // In production, enforce CSRF token for authenticated state-changing operations
  if (isProduction && req.user) {
    const csrfToken = req.headers['x-csrf-token'] as string;
    // Extract user ID from Express.User (set by authenticate middleware)
    const user = req.user as Express.User;
    const userId = typeof user._id === 'string' 
      ? user._id 
      : user._id?.toString();

    if (!csrfToken) {
      return next(new AppError('CSRF token required', 403));
    }

    if (!userId) {
      return next(new AppError('User ID required for CSRF validation', 403));
    }

    const isValid = await validateToken(userId, csrfToken);
    if (!isValid) {
      return next(new AppError('Invalid CSRF token', 403));
    }
  }

  next();
};

/**
 * Generate and return a CSRF token for the authenticated user
 * Should be called after login/registration and stored in the frontend
 */
export const generateCsrfToken = async (userId: string): Promise<string> => {
  const token = generateToken();
  await storeToken(userId, token);
  return token;
};

