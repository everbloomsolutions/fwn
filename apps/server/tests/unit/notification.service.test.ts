import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import * as notificationService from '../../src/modules/notification/notification.service';
import { Notification } from '../../src/modules/notification/notification.model';
import { AppError } from '../../src/core/exceptions/errorHandler';
import * as authService from '../../src/modules/auth/auth.service';

describe('NotificationService', () => {
  let userId: string;
  let otherUserId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();

    const user1 = await authService.registerUser({
      email: 'user1@example.com',
      password: 'Password123',
    });
    userId = user1.user._id.toString();

    const user2 = await authService.registerUser({
      email: 'user2@example.com',
      password: 'Password123',
    });
    otherUserId = user2.user._id.toString();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const data = {
        userId,
        title: 'Test Notification',
        message: 'Test message',
        type: 'info' as const,
      };

      const notification = await notificationService.createNotification(data);

      expect(notification).toHaveProperty('_id');
      expect(notification.title).toBe('Test Notification');
      expect(notification.message).toBe('Test message');
      expect(notification.type).toBe('info');
      expect(notification.isRead).toBe(false);
      expect(notification.user.toString()).toBe(userId);
    });

    it('should create notification with default type', async () => {
      const data = {
        userId,
        title: 'Test Notification',
        message: 'Test message',
      };

      const notification = await notificationService.createNotification(data);

      expect(notification.type).toBe('info');
    });

    it('should create notification with link and metadata', async () => {
      const data = {
        userId,
        title: 'Test Notification',
        message: 'Test message',
        link: '/projects/123',
        metadata: { projectId: '123' },
      };

      const notification = await notificationService.createNotification(data);

      expect(notification.link).toBe('/projects/123');
      expect(notification.metadata).toEqual({ projectId: '123' });
    });
  });

  describe('createBatchNotifications', () => {
    it('should create multiple notifications successfully', async () => {
      const notifications = [
        {
          userId,
          title: 'Notification 1',
          message: 'Message 1',
        },
        {
          userId,
          title: 'Notification 2',
          message: 'Message 2',
        },
        {
          userId: otherUserId,
          title: 'Notification 3',
          message: 'Message 3',
        },
      ];

      const created = await notificationService.createBatchNotifications(notifications);

      expect(created).toHaveLength(3);
      expect(created[0].title).toBe('Notification 1');
      expect(created[2].user.toString()).toBe(otherUserId);
    });
  });

  describe('getNotificationById', () => {
    let notificationId: string;

    beforeEach(async () => {
      const notification = await notificationService.createNotification({
        userId,
        title: 'Test Notification',
        message: 'Test message',
      });
      notificationId = notification._id.toString();
    });

    it('should get notification by id', async () => {
      const notification = await notificationService.getNotificationById(notificationId);

      expect(notification._id.toString()).toBe(notificationId);
      expect(notification.title).toBe('Test Notification');
    });

    it('should throw error if notification not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(notificationService.getNotificationById(fakeId)).rejects.toThrow(AppError);
      await expect(notificationService.getNotificationById(fakeId)).rejects.toThrow(
        'Notification not found'
      );
    });
  });

  describe('getUserNotifications', () => {
    beforeEach(async () => {
      // Create multiple notifications
      await notificationService.createNotification({
        userId,
        title: 'Notification 1',
        message: 'Message 1',
        type: 'info',
      });
      await notificationService.createNotification({
        userId,
        title: 'Notification 2',
        message: 'Message 2',
        type: 'success',
      });
      const readNotification = await notificationService.createNotification({
        userId,
        title: 'Notification 3',
        message: 'Message 3',
        type: 'warning',
      });
      readNotification.isRead = true;
      await readNotification.save();

      // Create notification for other user
      await notificationService.createNotification({
        userId: otherUserId,
        title: 'Other Notification',
        message: 'Other message',
      });
    });

    it('should get user notifications with pagination', async () => {
      const result = await notificationService.getUserNotifications(userId, {
        page: 1,
        limit: 2,
      });

      expect(result.notifications).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(2);
      expect(result.unreadCount).toBe(2);
    });

    it('should filter notifications by read status', async () => {
      const unreadResult = await notificationService.getUserNotifications(userId, {
        isRead: false,
      });

      expect(unreadResult.notifications).toHaveLength(2);
      expect(unreadResult.notifications.every((n) => !n.isRead)).toBe(true);

      const readResult = await notificationService.getUserNotifications(userId, {
        isRead: true,
      });

      expect(readResult.notifications).toHaveLength(1);
      expect(readResult.notifications[0].isRead).toBe(true);
    });

    it('should filter notifications by type', async () => {
      const result = await notificationService.getUserNotifications(userId, {
        type: 'info',
      });

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].type).toBe('info');
    });

    it('should only return notifications for specified user', async () => {
      const result = await notificationService.getUserNotifications(userId, {});

      expect(result.notifications.every((n) => n.user.toString() === userId)).toBe(true);
      expect(result.notifications.length).toBe(3);
    });

    it('should return correct unread count', async () => {
      const result = await notificationService.getUserNotifications(userId, {});

      expect(result.unreadCount).toBe(2);
    });
  });

  describe('markAsRead', () => {
    let notificationId: string;

    beforeEach(async () => {
      const notification = await notificationService.createNotification({
        userId,
        title: 'Test Notification',
        message: 'Test message',
      });
      notificationId = notification._id.toString();
    });

    it('should mark notification as read', async () => {
      const notification = await notificationService.markAsRead(notificationId, userId);

      expect(notification.isRead).toBe(true);

      // Verify in database
      const updated = await Notification.findById(notificationId);
      expect(updated?.isRead).toBe(true);
    });

    it('should throw error if notification not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(notificationService.markAsRead(fakeId, userId)).rejects.toThrow(AppError);
      await expect(notificationService.markAsRead(fakeId, userId)).rejects.toThrow(
        'Notification not found'
      );
    });

    it('should throw error if user does not own notification', async () => {
      await expect(notificationService.markAsRead(notificationId, otherUserId)).rejects.toThrow(
        AppError
      );
      await expect(notificationService.markAsRead(notificationId, otherUserId)).rejects.toThrow(
        'You do not have permission to update this notification'
      );
    });
  });

  describe('markAllAsRead', () => {
    beforeEach(async () => {
      // Create multiple unread notifications
      await notificationService.createNotification({
        userId,
        title: 'Notification 1',
        message: 'Message 1',
      });
      await notificationService.createNotification({
        userId,
        title: 'Notification 2',
        message: 'Message 2',
      });
      await notificationService.createNotification({
        userId,
        title: 'Notification 3',
        message: 'Message 3',
      });
    });

    it('should mark all user notifications as read', async () => {
      await notificationService.markAllAsRead(userId);

      const result = await notificationService.getUserNotifications(userId, { isRead: false });
      expect(result.notifications).toHaveLength(0);

      const readResult = await notificationService.getUserNotifications(userId, { isRead: true });
      expect(readResult.notifications.length).toBeGreaterThanOrEqual(3);
    });

    it('should not affect other users notifications', async () => {
      await notificationService.createNotification({
        userId: otherUserId,
        title: 'Other Notification',
        message: 'Other message',
      });

      await notificationService.markAllAsRead(userId);

      const otherUserResult = await notificationService.getUserNotifications(otherUserId, {
        isRead: false,
      });
      expect(otherUserResult.notifications).toHaveLength(1);
    });
  });

  describe('deleteNotification', () => {
    let notificationId: string;

    beforeEach(async () => {
      const notification = await notificationService.createNotification({
        userId,
        title: 'Test Notification',
        message: 'Test message',
      });
      notificationId = notification._id.toString();
    });

    it('should delete notification successfully', async () => {
      await notificationService.deleteNotification(notificationId, userId);

      await expect(notificationService.getNotificationById(notificationId)).rejects.toThrow(
        'Notification not found'
      );
    });

    it('should throw error if notification not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(notificationService.deleteNotification(fakeId, userId)).rejects.toThrow(
        AppError
      );
      await expect(notificationService.deleteNotification(fakeId, userId)).rejects.toThrow(
        'Notification not found'
      );
    });

    it('should throw error if user does not own notification', async () => {
      await expect(notificationService.deleteNotification(notificationId, otherUserId)).rejects.toThrow(
        AppError
      );
      await expect(notificationService.deleteNotification(notificationId, otherUserId)).rejects.toThrow(
        'You do not have permission to delete this notification'
      );
    });
  });
});

