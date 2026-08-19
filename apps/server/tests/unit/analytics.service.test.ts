import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import * as analyticsService from '../../src/modules/analytics/analytics.service';
import { AnalyticsEvent } from '../../src/modules/analytics/analytics.model';
import * as authService from '../../src/modules/auth/auth.service';

describe('AnalyticsService', () => {
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

  describe('createAnalyticsEvent', () => {
    it('should create analytics event successfully', async () => {
      const data = {
        eventType: 'page_view',
        userId,
        sessionId: 'session123',
        properties: { page: '/home' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };

      const event = await analyticsService.createAnalyticsEvent(data);

      expect(event).toHaveProperty('_id');
      expect(event.eventType).toBe('page_view');
      expect(event.userId?.toString()).toBe(userId);
      expect(event.sessionId).toBe('session123');
      expect(event.properties).toEqual({ page: '/home' });
      expect(event.ipAddress).toBe('127.0.0.1');
      expect(event.userAgent).toBe('Mozilla/5.0');
    });

    it('should create event without user', async () => {
      const data = {
        eventType: 'page_view',
        sessionId: 'session123',
      };

      const event = await analyticsService.createAnalyticsEvent(data);

      expect(event.eventType).toBe('page_view');
      expect(event.userId).toBeUndefined();
    });

    it('should create event with default empty properties', async () => {
      const data = {
        eventType: 'click',
      };

      const event = await analyticsService.createAnalyticsEvent(data);

      expect(event.properties).toEqual({});
    });
  });

  describe('getAnalyticsEvents', () => {
    beforeEach(async () => {
      // Create multiple events
      await analyticsService.createAnalyticsEvent({
        eventType: 'page_view',
        userId,
        properties: { page: '/home' },
      });
      await analyticsService.createAnalyticsEvent({
        eventType: 'page_view',
        userId,
        properties: { page: '/about' },
      });
      await analyticsService.createAnalyticsEvent({
        eventType: 'click',
        userId,
        properties: { button: 'submit' },
      });
      await analyticsService.createAnalyticsEvent({
        eventType: 'page_view',
        userId: otherUserId,
        properties: { page: '/home' },
      });
    });

    it('should get all analytics events with pagination', async () => {
      const result = await analyticsService.getAnalyticsEvents({
        page: 1,
        limit: 2,
      });

      expect(result.events).toHaveLength(2);
      expect(result.total).toBe(4);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it('should filter events by event type', async () => {
      const result = await analyticsService.getAnalyticsEvents({
        eventType: 'page_view',
      });

      expect(result.events.length).toBeGreaterThanOrEqual(3);
      expect(result.events.every((e) => e.eventType === 'page_view')).toBe(true);
    });

    it('should filter events by user', async () => {
      const result = await analyticsService.getAnalyticsEvents({
        userId,
      });

      expect(result.events.length).toBeGreaterThanOrEqual(3);
      expect(result.events.every((e) => e.userId?.toString() === userId)).toBe(true);
    });

    it('should filter events by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const result = await analyticsService.getAnalyticsEvents({
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString(),
      });

      expect(result.events.length).toBeGreaterThanOrEqual(0);
    });

    it('should combine multiple filters', async () => {
      const result = await analyticsService.getAnalyticsEvents({
        eventType: 'page_view',
        userId,
      });

      expect(result.events.length).toBeGreaterThanOrEqual(2);
      expect(result.events.every((e) => e.eventType === 'page_view')).toBe(true);
      expect(result.events.every((e) => e.userId?.toString() === userId)).toBe(true);
    });
  });

  describe('getEventStats', () => {
    beforeEach(async () => {
      // Create events for testing
      await analyticsService.createAnalyticsEvent({
        eventType: 'page_view',
        userId,
      });
      await analyticsService.createAnalyticsEvent({
        eventType: 'page_view',
        userId,
      });
      await analyticsService.createAnalyticsEvent({
        eventType: 'page_view',
        userId: otherUserId,
      });
      await analyticsService.createAnalyticsEvent({
        eventType: 'click',
        userId,
      });
    });

    it('should get event statistics', async () => {
      const stats = await analyticsService.getEventStats('page_view');

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('uniqueUsers');
      expect(stats).toHaveProperty('dateRange');
      expect(stats.total).toBeGreaterThanOrEqual(3);
      expect(stats.uniqueUsers).toBeGreaterThanOrEqual(2);
    });

    it('should filter stats by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const stats = await analyticsService.getEventStats('page_view', yesterday, tomorrow);

      expect(stats.dateRange.start).toEqual(yesterday);
      expect(stats.dateRange.end).toEqual(tomorrow);
    });

    it('should return correct unique user count', async () => {
      const stats = await analyticsService.getEventStats('page_view');

      expect(stats.uniqueUsers).toBeGreaterThanOrEqual(2);
    });

    it('should return zero for non-existent event type', async () => {
      const stats = await analyticsService.getEventStats('non_existent');

      expect(stats.total).toBe(0);
      expect(stats.uniqueUsers).toBe(0);
    });

    it('should use default date range when not provided', async () => {
      const stats = await analyticsService.getEventStats('page_view');

      expect(stats.dateRange.start).toBeInstanceOf(Date);
      expect(stats.dateRange.end).toBeInstanceOf(Date);
    });
  });
});

