import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import createApp from '../../src/core/http/app';
import { createTestUser, createTestAnalyticsEvent } from '../utils/testHelpers';

const app = createApp();

describe('Analytics Routes', () => {
  let userToken: string;
  let userId: string;
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();

    const user = await createTestUser({ email: 'user@example.com' });
    userToken = user.token;
    userId = user._id;

    const admin = await createTestUser({ email: 'admin@example.com', role: 'admin' });
    adminToken = admin.token;
    adminId = admin._id;
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/v1/analytics/events', () => {
    it('should create analytics event without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send({
          eventType: 'page_view',
          sessionId: 'test-session',
          properties: { page: '/home' },
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventType).toBe('page_view');
    });

    it('should create analytics event with user', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send({
          eventType: 'click',
          userId: userId,
          sessionId: 'test-session',
          properties: { button: 'submit' },
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(userId);
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .post('/api/v1/analytics/events')
        .send({
          eventType: '',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/analytics/events', () => {
    beforeEach(async () => {
      await createTestAnalyticsEvent({ eventType: 'page_view', userId });
      await createTestAnalyticsEvent({ eventType: 'page_view', userId });
      await createTestAnalyticsEvent({ eventType: 'click', userId });
    });

    it('should get analytics events as admin', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter events by event type', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/events?eventType=page_view')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events.every((e: { eventType: string }) => e.eventType === 'page_view')).toBe(true);
    });

    it('should filter events by user', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/events?userId=${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events.every((e: { userId: string }) => e.userId === userId)).toBe(true);
    });

    it('should paginate events', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/events?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events.length).toBeLessThanOrEqual(2);
      expect(response.body.data.page).toBe(1);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/analytics/events')
        .expect(401);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app)
        .get('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/v1/analytics/stats/:eventType', () => {
    beforeEach(async () => {
      await createTestAnalyticsEvent({ eventType: 'page_view', userId });
      await createTestAnalyticsEvent({ eventType: 'page_view', userId });
      await createTestAnalyticsEvent({ eventType: 'click', userId });
    });

    it('should get event statistics as admin', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/stats/page_view')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('uniqueUsers');
      expect(response.body.data.total).toBeGreaterThanOrEqual(2);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/analytics/stats/page_view')
        .expect(401);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app)
        .get('/api/v1/analytics/stats/page_view')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});

