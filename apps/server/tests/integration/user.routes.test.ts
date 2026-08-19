import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import createApp from '../../src/core/http/app';
import { createTestUser } from '../utils/testHelpers';
import * as authService from '../../src/modules/auth/auth.service';

const app = createApp();

describe('User Routes', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();

    const user = await createTestUser({ email: 'user@example.com', name: 'Test User' });
    userToken = user.token;
    userId = user._id;
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('PUT /api/v1/profile/update', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/v1/profile/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Name',
          email: 'updated@example.com',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.email).toBe('updated@example.com');
    });

    it('should update only name', async () => {
      const response = await request(app)
        .put('/api/v1/profile/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New Name',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Name');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .put('/api/v1/profile/update')
        .send({
          name: 'New Name',
        })
        .expect(401);
    });

    it('should return 400 for invalid email', async () => {
      await request(app)
        .put('/api/v1/profile/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/profile/change-password', () => {
    it('should change password successfully', async () => {
      const response = await request(app)
        .post('/api/v1/profile/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewPassword456',
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify new password works
      const loginResult = await authService.loginUser({
        email: 'user@example.com',
        password: 'NewPassword456',
      });
      expect(loginResult).toHaveProperty('token');
    });

    it('should return 400 for incorrect current password', async () => {
      await request(app)
        .post('/api/v1/profile/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword456',
        })
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/profile/change-password')
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewPassword456',
        })
        .expect(401);
    });
  });

  describe('PATCH /api/v1/profile/onboarding/profile', () => {
    it('should update onboarding profile', async () => {
      const response = await request(app)
        .patch('/api/v1/profile/onboarding/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phoneNumber: '+1234567890',
          company: 'Test Company',
          preferences: { theme: 'dark' },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .patch('/api/v1/profile/onboarding/profile')
        .send({
          phoneNumber: '+1234567890',
        })
        .expect(401);
    });
  });

  describe('POST /api/v1/profile/onboarding/complete', () => {
    it('should complete onboarding', async () => {
      const response = await request(app)
        .post('/api/v1/profile/onboarding/complete')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/profile/onboarding/complete')
        .expect(401);
    });
  });

  describe('GET /api/v1/profile/onboarding/status', () => {
    it('should get onboarding status', async () => {
      const response = await request(app)
        .get('/api/v1/profile/onboarding/status')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('onboardingCompleted');
      expect(response.body.data).toHaveProperty('profileComplete');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/profile/onboarding/status')
        .expect(401);
    });
  });
});

