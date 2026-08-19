import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import * as userService from '../../src/modules/user/user.service';
import { User } from '../../src/modules/user/user.model';
import { AppError } from '../../src/core/exceptions/errorHandler';
import * as authService from '../../src/modules/auth/auth.service';

describe('UserService', () => {
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

  describe('updateProfile', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await authService.registerUser({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
      userId = result.user._id.toString();
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const result = await userService.updateProfile(userId, updateData);

      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('updated@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should update only name when provided', async () => {
      const updateData = {
        name: 'New Name',
      };

      const result = await userService.updateProfile(userId, updateData);

      expect(result.name).toBe('New Name');
      expect(result.email).toBe('test@example.com');
    });

    it('should update only email when provided', async () => {
      const updateData = {
        email: 'newemail@example.com',
      };

      const result = await userService.updateProfile(userId, updateData);

      expect(result.email).toBe('newemail@example.com');
      expect(result.name).toBe('Test User');
    });

    it('should lowercase email before saving', async () => {
      const updateData = {
        email: 'UPPERCASE@EXAMPLE.COM',
      };

      const result = await userService.updateProfile(userId, updateData);

      expect(result.email).toBe('uppercase@example.com');
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: 'New Name' };

      await expect(userService.updateProfile(fakeId, updateData)).rejects.toThrow(AppError);
      await expect(userService.updateProfile(fakeId, updateData)).rejects.toThrow('User not found');
    });

    it('should throw error if user is inactive', async () => {
      const user = await User.findById(userId);
      if (user) {
        user.isActive = false;
        await user.save();
      }

      const updateData = { name: 'New Name' };

      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(AppError);
      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(
        'User account is inactive'
      );
    });

    it('should throw error if email is already in use', async () => {
      // Create another user
      await authService.registerUser({
        email: 'existing@example.com',
        password: 'Password123',
      });

      const updateData = {
        email: 'existing@example.com',
      };

      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(AppError);
      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(
        'Email is already in use'
      );
    });

    it('should allow updating to same email', async () => {
      const user = await User.findById(userId);
      const currentEmail = user?.email;

      const updateData = {
        email: currentEmail,
      };

      const result = await userService.updateProfile(userId, updateData);

      expect(result.email).toBe(currentEmail);
    });
  });

  describe('changePassword', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await authService.registerUser({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
      userId = result.user._id.toString();
    });

    it('should change password successfully', async () => {
      const changeData = {
        currentPassword: 'Password123',
        newPassword: 'NewPassword456',
      };

      await expect(userService.changePassword(userId, changeData)).resolves.not.toThrow();

      // Verify new password works
      const loginResult = await authService.loginUser({
        email: 'test@example.com',
        password: 'NewPassword456',
      });

      expect(loginResult).toHaveProperty('token');
    });

    it('should throw error if current password is incorrect', async () => {
      const changeData = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword456',
      };

      await expect(userService.changePassword(userId, changeData)).rejects.toThrow(AppError);
      await expect(userService.changePassword(userId, changeData)).rejects.toThrow(
        'Current password is incorrect'
      );
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const changeData = {
        currentPassword: 'Password123',
        newPassword: 'NewPassword456',
      };

      await expect(userService.changePassword(fakeId, changeData)).rejects.toThrow(AppError);
      await expect(userService.changePassword(fakeId, changeData)).rejects.toThrow('User not found');
    });

    it('should throw error if user is inactive', async () => {
      const user = await User.findById(userId);
      if (user) {
        user.isActive = false;
        await user.save();
      }

      const changeData = {
        currentPassword: 'Password123',
        newPassword: 'NewPassword456',
      };

      await expect(userService.changePassword(userId, changeData)).rejects.toThrow(AppError);
      await expect(userService.changePassword(userId, changeData)).rejects.toThrow(
        'User account is inactive'
      );
    });
  });

  describe('updateOnboardingProfile', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await authService.registerUser({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
      userId = result.user._id.toString();
    });

    it('should update onboarding profile successfully', async () => {
      const updateData = {
        name: 'Onboarding Name',
        phoneNumber: '+1234567890',
        company: 'Test Company',
        preferences: { theme: 'dark' },
      };

      const result = await userService.updateOnboardingProfile(userId, updateData);

      expect(result.name).toBe('Onboarding Name');
      expect(result).not.toHaveProperty('password');

      // Verify in database
      const user = await User.findById(userId);
      expect(user?.phoneNumber).toBe('+1234567890');
      expect(user?.company).toBe('Test Company');
      expect(user?.preferences).toEqual({ theme: 'dark' });
    });

    it('should update partial onboarding profile', async () => {
      const updateData = {
        phoneNumber: '+1234567890',
      };

      const result = await userService.updateOnboardingProfile(userId, updateData);

      expect(result.name).toBe('Test User');
      expect(result).not.toHaveProperty('password');

      const user = await User.findById(userId);
      expect(user?.phoneNumber).toBe('+1234567890');
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        phoneNumber: '+1234567890',
      };

      await expect(userService.updateOnboardingProfile(fakeId, updateData)).rejects.toThrow(
        AppError
      );
      await expect(userService.updateOnboardingProfile(fakeId, updateData)).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw error if user is inactive', async () => {
      const user = await User.findById(userId);
      if (user) {
        user.isActive = false;
        await user.save();
      }

      const updateData = {
        phoneNumber: '+1234567890',
      };

      await expect(userService.updateOnboardingProfile(userId, updateData)).rejects.toThrow(
        AppError
      );
      await expect(userService.updateOnboardingProfile(userId, updateData)).rejects.toThrow(
        'User account is inactive'
      );
    });
  });

  describe('completeOnboarding', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await authService.registerUser({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
      userId = result.user._id.toString();
    });

    it('should complete onboarding successfully', async () => {
      await expect(userService.completeOnboarding(userId)).resolves.not.toThrow();

      const user = await User.findById(userId);
      expect(user?.onboardingCompleted).toBe(true);
      expect(user?.onboardingCompletedAt).toBeInstanceOf(Date);
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(userService.completeOnboarding(fakeId)).rejects.toThrow(AppError);
      await expect(userService.completeOnboarding(fakeId)).rejects.toThrow('User not found');
    });

    it('should throw error if user is inactive', async () => {
      const user = await User.findById(userId);
      if (user) {
        user.isActive = false;
        await user.save();
      }

      await expect(userService.completeOnboarding(userId)).rejects.toThrow(AppError);
      await expect(userService.completeOnboarding(userId)).rejects.toThrow(
        'User account is inactive'
      );
    });
  });

  describe('getOnboardingStatus', () => {
    let userId: string;

    beforeEach(async () => {
      const result = await authService.registerUser({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
      userId = result.user._id.toString();
    });

    it('should return onboarding status for new user', async () => {
      const status = await userService.getOnboardingStatus(userId);

      expect(status.onboardingCompleted).toBe(false);
      expect(status.profileComplete).toBe(50); // email and name = 50%
    });

    it('should return 100% profile complete when all fields filled', async () => {
      await userService.updateOnboardingProfile(userId, {
        phoneNumber: '+1234567890',
        company: 'Test Company',
      });

      const status = await userService.getOnboardingStatus(userId);

      expect(status.profileComplete).toBe(100);
    });

    it('should return onboarding completed status', async () => {
      await userService.completeOnboarding(userId);

      const status = await userService.getOnboardingStatus(userId);

      expect(status.onboardingCompleted).toBe(true);
      expect(status.onboardingCompletedAt).toBeInstanceOf(Date);
    });

    it('should calculate profile completion correctly', async () => {
      // Start with 50% (email, name)
      let status = await userService.getOnboardingStatus(userId);
      expect(status.profileComplete).toBe(50);

      // Add phoneNumber -> 75%
      await userService.updateOnboardingProfile(userId, {
        phoneNumber: '+1234567890',
      });
      status = await userService.getOnboardingStatus(userId);
      expect(status.profileComplete).toBe(75);

      // Add company -> 100%
      await userService.updateOnboardingProfile(userId, {
        company: 'Test Company',
      });
      status = await userService.getOnboardingStatus(userId);
      expect(status.profileComplete).toBe(100);
    });

    it('should throw error if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(userService.getOnboardingStatus(fakeId)).rejects.toThrow(AppError);
      await expect(userService.getOnboardingStatus(fakeId)).rejects.toThrow('User not found');
    });
  });
});

