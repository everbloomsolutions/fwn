import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import * as adminService from '../../src/modules/admin/admin.service';
import { User } from '../../src/modules/user/user.model';
import * as authService from '../../src/modules/auth/auth.service';

describe('AdminService', () => {
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

  describe('getAdminStats', () => {
    it('should return admin statistics', async () => {
      // Create some test users
      await authService.registerUser({
        email: 'user1@example.com',
        password: 'Password123',
        name: 'User 1',
      });
      await authService.registerUser({
        email: 'user2@example.com',
        password: 'Password123',
        name: 'User 2',
      });

      const stats = await adminService.getAdminStats();

      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('activeUsers');
      expect(stats).toHaveProperty('totalContent');
      expect(stats).toHaveProperty('recentActivity');
      expect(stats.totalUsers).toBeGreaterThanOrEqual(2);
      expect(stats.activeUsers).toBeGreaterThanOrEqual(2);
      expect(stats.totalContent).toBe(0); // Placeholder
    });

    it('should count active users correctly', async () => {
      await authService.registerUser({
        email: 'active@example.com',
        password: 'Password123',
      });

      // Create inactive user
      const inactiveUser = await authService.registerUser({
        email: 'inactive@example.com',
        password: 'Password123',
      });
      const user = await User.findById(inactiveUser.user._id);
      if (user) {
        user.isActive = false;
        await user.save();
      }

      const stats = await adminService.getAdminStats();

      expect(stats.activeUsers).toBeGreaterThanOrEqual(1);
    });

    it('should return zero stats for empty database', async () => {
      const stats = await adminService.getAdminStats();

      expect(stats.totalUsers).toBe(0);
      expect(stats.activeUsers).toBe(0);
      expect(stats.totalContent).toBe(0);
      expect(stats.recentActivity).toBe(0);
    });
  });

  describe('getAdminDashboard', () => {
    beforeEach(async () => {
      // Create multiple users
      await authService.registerUser({
        email: 'user1@example.com',
        password: 'Password123',
        name: 'User 1',
      });
      await authService.registerUser({
        email: 'user2@example.com',
        password: 'Password123',
        name: 'User 2',
      });
      await authService.registerUser({
        email: 'user3@example.com',
        password: 'Password123',
        name: 'User 3',
      });
    });

    it('should return dashboard data with stats and recent users', async () => {
      const dashboard = await adminService.getAdminDashboard();

      expect(dashboard).toHaveProperty('stats');
      expect(dashboard).toHaveProperty('recentUsers');
      expect(dashboard.stats.totalUsers).toBeGreaterThanOrEqual(3);
      expect(dashboard.recentUsers.length).toBeGreaterThanOrEqual(3);
    });

    it('should return recent users sorted by creation date', async () => {
      const dashboard = await adminService.getAdminDashboard();

      expect(dashboard.recentUsers.length).toBeGreaterThanOrEqual(3);
      // Verify sorting (most recent first)
      for (let i = 1; i < dashboard.recentUsers.length; i++) {
        const prevDate = new Date(dashboard.recentUsers[i - 1].createdAt);
        const currDate = new Date(dashboard.recentUsers[i].createdAt);
        expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
      }
    });

    it('should limit recent users to 10', async () => {
      // Create more than 10 users
      for (let i = 4; i <= 15; i++) {
        await authService.registerUser({
          email: `user${i}@example.com`,
          password: 'Password123',
          name: `User ${i}`,
        });
      }

      const dashboard = await adminService.getAdminDashboard();

      expect(dashboard.recentUsers.length).toBeLessThanOrEqual(10);
    });

    it('should return user data with correct structure', async () => {
      const dashboard = await adminService.getAdminDashboard();

      if (dashboard.recentUsers.length > 0) {
        const user = dashboard.recentUsers[0];
        expect(user).toHaveProperty('_id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('createdAt');
        expect(['user', 'admin']).toContain(user.role);
      }
    });

    it('should return empty recent users for empty database', async () => {
      await cleanupTestDB();

      const dashboard = await adminService.getAdminDashboard();

      expect(dashboard.stats.totalUsers).toBe(0);
      expect(dashboard.recentUsers).toHaveLength(0);
    });
  });
});

