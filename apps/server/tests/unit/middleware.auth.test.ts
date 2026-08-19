import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { authenticate, requireAdmin } from '../../src/core/middleware/auth';
import { User } from '../../src/modules/user/user.model';
import { AppError } from '../../src/core/exceptions/errorHandler';
import * as authService from '../../src/modules/auth/auth.service';
import { generateTokens } from '../../src/core/utils/jwt';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();

    mockRequest = {
      headers: {},
      user: undefined,
    };
    mockResponse = {};
    mockNext = vi.fn();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('authenticate', () => {
    it('should authenticate valid token and set user', async () => {
      // Create user and generate token
      const userResult = await authService.registerUser({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
      const userId = userResult.user._id.toString();
      const tokens = generateTokens(userId, 'test@example.com', 'user');

      mockRequest.headers = {
        authorization: `Bearer ${tokens.token}`,
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeTruthy();
      expect(mockRequest.user?.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error if no authorization header', async () => {
      mockRequest.headers = {};

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
    });

    it('should throw error if authorization header does not start with Bearer', async () => {
      mockRequest.headers = {
        authorization: 'Invalid token',
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      expect(error.message).toBe('Authentication required');
    });

    it('should throw error if token is empty', async () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      expect(error.message).toBe('Authentication required');
    });

    it('should throw error if token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      expect(error.message).toBe('Invalid token');
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const tokens = generateTokens(fakeId, 'fake@example.com', 'user');

      mockRequest.headers = {
        authorization: `Bearer ${tokens.token}`,
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      expect(error.message).toBe('User not found');
    });

    it('should throw error if user is inactive', async () => {
      const userResult = await authService.registerUser({
        email: 'inactive@example.com',
        password: 'Password123',
      });
      const userId = userResult.user._id.toString();

      const user = await User.findById(userId);
      if (user) {
        user.isActive = false;
        await user.save();
      }

      const tokens = generateTokens(userId, 'inactive@example.com', 'user');
      mockRequest.headers = {
        authorization: `Bearer ${tokens.token}`,
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      expect(error.message).toBe('User account is inactive');
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin user', () => {
      const userResult = {
        _id: new mongoose.Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
      };
      mockRequest.user = userResult as Express.User;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject non-admin user', () => {
      const userResult = {
        _id: new mongoose.Types.ObjectId(),
        email: 'user@example.com',
        role: 'user',
      };
      mockRequest.user = userResult as Express.User;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      expect(error.message).toBe('Admin access required');
      expect(error.statusCode).toBe(403);
    });

    it('should reject if no user', () => {
      mockRequest.user = undefined;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0] as AppError;
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
    });
  });
});

