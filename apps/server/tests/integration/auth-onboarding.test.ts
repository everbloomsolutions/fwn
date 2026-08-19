/**
 * Integration tests for auth flows with onboarding
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import createApp from '../../src/core/http/app';
import { User } from '../../src/modules/user/user.model';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';

describe('Auth Flows with Onboarding', () => {
  let app: Express;

  beforeAll(async () => {
    await setupTestDB();
    app = createApp();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('Traditional Registration Flow', () => {
    it('should register new user and return isNewUser flag', async () => {
      const email = `newuser-${Date.now()}@example.com`;
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'Test1234',
          name: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isNewUser');
      expect(response.body.data.isNewUser).toBe(true);
      expect(response.body.data.user.email).toBe(email);
      expect(response.body.data.token).toBeDefined();

      // Verify user was created with onboardingCompleted = false
      const user = await User.findOne({ email });
      expect(user).toBeDefined();
      expect(user?.onboardingCompleted).toBe(false);

      // Cleanup
      await User.findByIdAndDelete(user?._id);
    });

    it('should not return isNewUser for existing user login', async () => {
      // First register
      const email = `existing-${Date.now()}@example.com`;
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'Test1234',
          name: 'Existing User',
        });

      expect(registerResponse.status).toBe(201);
      const userId = registerResponse.body.data.user._id;

      // Then login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email,
          password: 'Test1234',
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('isNewUser');
      expect(loginResponse.body.data.isNewUser).toBe(false);

      // Cleanup
      await User.findByIdAndDelete(userId);
    });
  });

  describe('User Model Onboarding Fields', () => {
    it('should create user with default onboarding fields', async () => {
      const email = `model-test-${Date.now()}@example.com`;
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'Test1234',
        });

      expect(response.status).toBe(201);

      const user = await User.findOne({ email });
      expect(user).toBeDefined();
      expect(user?.onboardingCompleted).toBe(false);
      expect(user?.onboardingCompletedAt).toBeUndefined();
      expect(user?.phoneNumber).toBeUndefined();
      expect(user?.company).toBeUndefined();

      // Cleanup
      await User.findByIdAndDelete(user?._id);
    });
  });
});

