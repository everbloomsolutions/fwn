import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import * as authService from '../../src/modules/auth/auth.service';
import { User } from '../../src/modules/user/user.model';
import { AppError } from '../../src/core/exceptions/errorHandler';
import { verifyToken } from '../../src/core/utils/jwt';

describe('AuthService', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      const result = await authService.registerUser(data);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(data.email.toLowerCase());
      expect(result.user.name).toBe(data.name);
      expect(result.user).not.toHaveProperty('password');

      // Verify token is valid
      const decoded = verifyToken(result.token);
      expect(decoded.userId).toBe(result.user._id.toString());
      expect(decoded.email).toBe(data.email.toLowerCase());
    });

    it('should throw error if email already exists', async () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123',
      };

      await authService.registerUser(data);

      await expect(authService.registerUser(data)).rejects.toThrow(AppError);
      await expect(authService.registerUser(data)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should lowercase email before saving', async () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'Password123',
      };

      const result = await authService.registerUser(data);
      expect(result.user.email).toBe('test@example.com');
    });

    it('should hash password before saving', async () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123',
      };

      await authService.registerUser(data);
      const user = await User.findOne({ email: data.email });
      expect(user?.password).not.toBe(data.password);
      expect(user?.password).toHaveLength(60); // bcrypt hash length
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      await cleanupTestDB();
      await authService.registerUser({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
    });

    it('should login user with valid credentials', async () => {
      const result = await authService.loginUser({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.loginUser({
          email: 'wrong@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow(AppError);
      await expect(
        authService.loginUser({
          email: 'wrong@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      await expect(
        authService.loginUser({
          email: 'test@example.com',
          password: 'WrongPassword123',
        })
      ).rejects.toThrow(AppError);
      await expect(
        authService.loginUser({
          email: 'test@example.com',
          password: 'WrongPassword123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for inactive user', async () => {
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      
      if (user) {
        user.isActive = false;
        await user.save();
      }

      // isActive is checked before password, so should get inactive error
      await expect(
        authService.loginUser({
          email: 'test@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow(AppError);
      await expect(
        authService.loginUser({
          email: 'test@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow('User account is inactive');
    });
  });

  describe('getCurrentUser', () => {
    let userId: string;

    beforeEach(async () => {
      await cleanupTestDB();
      const result = await authService.registerUser({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
      userId = result.user._id.toString();
    });

    it('should get current user by id', async () => {
      const user = await authService.getCurrentUser(userId);

      expect(user).toHaveProperty('_id');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user).not.toHaveProperty('password');
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(authService.getCurrentUser(fakeId)).rejects.toThrow(AppError);
      await expect(authService.getCurrentUser(fakeId)).rejects.toThrow('User not found');
    });

    it('should throw error if user is inactive', async () => {
      const user = await User.findById(userId);
      expect(user).toBeTruthy();
      
      if (user) {
        user.isActive = false;
        await user.save();
        
        // Verify user was saved
        const updatedUser = await User.findById(userId);
        expect(updatedUser?.isActive).toBe(false);
      }

      await expect(authService.getCurrentUser(userId)).rejects.toThrow(AppError);
      await expect(authService.getCurrentUser(userId)).rejects.toThrow(
        'User account is inactive'
      );
    });
  });

  describe('refreshAccessToken', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await cleanupTestDB();
      const result = await authService.registerUser({
        email: 'test@example.com',
        password: 'Password123',
      });
      refreshToken = result.refreshToken!;
    });

    it('should refresh access token successfully', async () => {
      const result = await authService.refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.token).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();

      // Verify new token is valid
      const decoded = verifyToken(result.token);
      expect(decoded.email).toBe('test@example.com');
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(authService.refreshAccessToken('invalid-token')).rejects.toThrow(AppError);
      await expect(authService.refreshAccessToken('invalid-token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw error for inactive user', async () => {
      const user = await User.findOne({ email: 'test@example.com' });
      if (user) {
        user.isActive = false;
        await user.save();
      }

      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(AppError);
      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });
});
