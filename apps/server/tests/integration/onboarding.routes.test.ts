/**
 * Integration tests for onboarding routes
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import createApp from '../../src/core/http/app';
import { User } from '../../src/modules/user/user.model';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';

describe('Onboarding Routes', () => {
  let app: Express;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await setupTestDB();
    app = createApp();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();
    // Create a test user and get auth token for each test
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `test-${Date.now()}@example.com`,
        password: 'Test1234',
        name: 'Test User',
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.isNewUser).toBe(true);

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user._id;
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  describe('GET /api/v1/profile/onboarding/status', () => {
    it('should return onboarding status for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/profile/onboarding/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('onboardingCompleted');
      expect(response.body.data).toHaveProperty('profileComplete');
      expect(typeof response.body.data.onboardingCompleted).toBe('boolean');
      expect(typeof response.body.data.profileComplete).toBe('number');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/profile/onboarding/status');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/profile/onboarding/profile', () => {
    it('should update onboarding profile with valid data', async () => {
      const profileData = {
        name: 'Updated Name',
        phoneNumber: '+1234567890',
        company: 'Test Company',
      };

      const response = await request(app)
        .patch('/api/v1/profile/onboarding/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(profileData.name);
      expect(response.body.data.user.phoneNumber).toBe(profileData.phoneNumber);
      expect(response.body.data.user.company).toBe(profileData.company);
    });

    it('should update partial profile data', async () => {
      const profileData = {
        phoneNumber: '+9876543210',
      };

      const response = await request(app)
        .patch('/api/v1/profile/onboarding/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.phoneNumber).toBe(profileData.phoneNumber);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/profile/onboarding/profile')
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/profile/onboarding/complete', () => {
    it('should complete onboarding for authenticated user', async () => {
      const response = await request(app)
        .post('/api/v1/profile/onboarding/complete')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('completed');

      // Verify onboarding is marked as complete
      const statusResponse = await request(app)
        .get('/api/v1/profile/onboarding/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.body.data.onboardingCompleted).toBe(true);
      expect(statusResponse.body.data.onboardingCompletedAt).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/profile/onboarding/complete');

      expect(response.status).toBe(401);
    });
  });

  describe('Complete Onboarding Flow', () => {
    it('should complete full onboarding flow', async () => {
      // 1. Check initial status (should be incomplete)
      const initialStatus = await request(app)
        .get('/api/v1/profile/onboarding/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(initialStatus.body.data.onboardingCompleted).toBe(false);

      // 2. Update profile
      const updateResponse = await request(app)
        .patch('/api/v1/profile/onboarding/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Complete Flow User',
          phoneNumber: '+1111111111',
          company: 'Flow Test Company',
        });

      expect(updateResponse.status).toBe(200);

      // 3. Complete onboarding
      const completeResponse = await request(app)
        .post('/api/v1/profile/onboarding/complete')
        .set('Authorization', `Bearer ${authToken}`);

      expect(completeResponse.status).toBe(200);

      // 4. Verify final status
      const finalStatus = await request(app)
        .get('/api/v1/profile/onboarding/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalStatus.body.data.onboardingCompleted).toBe(true);
      expect(finalStatus.body.data.profileComplete).toBeGreaterThan(0);
    });
  });
});

