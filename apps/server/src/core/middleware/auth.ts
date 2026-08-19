import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../modules/user/user.model';
import { AppError } from '../exceptions/errorHandler';
import { verifyToken } from '../utils/jwt';
import { isTokenBlacklisted } from '../../modules/auth/auth.service';

// Re-export for backward compatibility
export type AuthRequest = Request;

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new AppError('Token has been revoked', 401);
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.isActive) {
      throw new AppError('User account is inactive', 403);
    }

    req.user = user as Express.User;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else if (error instanceof AppError) {
      next(error);
    } else {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      next(new AppError(message, 401));
    }
  }
};

export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        const isBlacklisted = await isTokenBlacklisted(token);
        if (!isBlacklisted) {
          const decoded = verifyToken(token);
          const user = await User.findById(decoded.userId).select('-password');
          if (user && user.isActive) {
            req.user = user as Express.User;
          }
        }
      }
    }

    next();
  } catch {
    next();
  }
};

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new AppError('Authentication required', 401));
    return;
  }

  if (req.user.role !== 'admin') {
    next(new AppError('Admin access required', 403));
    return;
  }

  next();
};

