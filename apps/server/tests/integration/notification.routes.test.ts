import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import createApp from '../../src/core/http/app';
import { createTestUser, createTestNotification } from '../utils/testHelpers';

const app = createApp();

describe('Notification Routes', () => {
  let userToken: string;
  let userId: string;
  let otherUserToken: string;
  let otherUserId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();

    const user = await createTestUser({ email: 'user@example.com' });
    userToken = user.token;
    userId = user._id;

    const otherUser = await createTestUser({ email: 'other@example.com' });
    otherUserToken = otherUser.token;
    otherUserId = otherUser._id;
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('GET /api/v1/notifications', () => {
    beforeEach(async () => {
      await createTestNotification(userId, { title: 'Notification 1', isRead: false });
      await createTestNotification(userId, { title: 'Notification 2', isRead: false });
      await createTestNotification(userId, { title: 'Notification 3', isRead: true });
      await createTestNotification(otherUserId, { title: 'Other Notification' });
    });

    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.unreadCount).toBe(2);
    });

    it('should filter notifications by read status', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?isRead=false')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toHaveLength(2);
      expect(response.body.data.notifications.every((n: { isRead: boolean }) => !n.isRead)).toBe(true);
    });

    it('should filter notifications by type', async () => {
      await createTestNotification(userId, { type: 'success' });

      const response = await request(app)
        .get('/api/v1/notifications?type=success')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications.every((n: { type: string }) => n.type === 'success')).toBe(true);
    });

    it('should paginate notifications', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications.length).toBeLessThanOrEqual(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/notifications')
        .expect(401);
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    let notificationId: string;

    beforeEach(async () => {
      const notification = await createTestNotification(userId, { isRead: false });
      notificationId = notification._id.toString();
    });

    it('should mark notification as read', async () => {
      const response = await request(app)
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isRead).toBe(true);
    });

    it('should return 404 for non-existent notification', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .patch(`/api/v1/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 403 for notification owned by another user', async () => {
      const otherNotification = await createTestNotification(otherUserId);
      const otherNotificationId = otherNotification._id.toString();

      await request(app)
        .patch(`/api/v1/notifications/${otherNotificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/v1/notifications/read-all', () => {
    beforeEach(async () => {
      await createTestNotification(userId, { isRead: false });
      await createTestNotification(userId, { isRead: false });
      await createTestNotification(userId, { isRead: true });
    });

    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify all are read
      const getResponse = await request(app)
        .get('/api/v1/notifications?isRead=false')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(getResponse.body.data.notifications).toHaveLength(0);
    });
  });

  describe('DELETE /api/v1/notifications/:id', () => {
    let notificationId: string;

    beforeEach(async () => {
      const notification = await createTestNotification(userId);
      notificationId = notification._id.toString();
    });

    it('should delete notification', async () => {
      const response = await request(app)
        .delete(`/api/v1/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deleted
      await request(app)
        .get(`/api/v1/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent notification', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .delete(`/api/v1/notifications/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 403 for notification owned by another user', async () => {
      const otherNotification = await createTestNotification(otherUserId);
      const otherNotificationId = otherNotification._id.toString();

      await request(app)
        .delete(`/api/v1/notifications/${otherNotificationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});

