import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import * as projectService from '../../src/modules/project/project.service';
import { Project } from '../../src/modules/project/project.model';
import { User } from '../../src/modules/user/user.model';
import * as authService from '../../src/modules/auth/auth.service';

describe('ProjectService', () => {
  let userId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();

    // Create test user
    const userResult = await authService.registerUser({
      email: 'user@example.com',
      password: 'Password123',
      name: 'Test User',
    });
    userId = userResult.user._id.toString();
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('createProject', () => {
    it('should create a new project successfully', async () => {
      const projectData = {
        userId,
        serviceType: 'electrical' as const,
        title: 'Test Project',
        description: 'Test Description',
        location: {
          address: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
        },
        priority: 'high' as const,
      };

      const project = await projectService.createProject(projectData);

      expect(project).toHaveProperty('_id');
      expect(project.serviceType).toBe('electrical');
      expect(project.title).toBe('Test Project');
      expect(project.status).toBe('pending');
      expect(project.userId.toString()).toBe(userId);
    });

    it('should create project with minimal data', async () => {
      const projectData = {
        userId,
        serviceType: 'cctv' as const,
        title: 'Minimal Project',
        description: 'Minimal Description',
      };

      const project = await projectService.createProject(projectData);

      expect(project.serviceType).toBe('cctv');
      expect(project.title).toBe('Minimal Project');
      expect(project.status).toBe('pending');
    });
  });

  describe('getUserProjects', () => {
    beforeEach(async () => {
      // Create multiple projects
      await projectService.createProject({
        userId,
        serviceType: 'electrical',
        title: 'Project 1',
        description: 'Description 1',
      });
      await projectService.createProject({
        userId,
        serviceType: 'cctv',
        title: 'Project 2',
        description: 'Description 2',
      });
      await projectService.createProject({
        userId,
        serviceType: 'electrical',
        title: 'Project 3',
        description: 'Description 3',
      });
    });

    it('should get all user projects', async () => {
      const projects = await projectService.getUserProjects(userId);

      expect(projects).toHaveLength(3);
      expect(projects[0].userId.toString()).toBe(userId);
    });

    it('should filter projects by status', async () => {
      // Update one project status
      const projects = await Project.find({ userId });
      if (projects[0]) {
        projects[0].status = 'quoted';
        await projects[0].save();
      }

      const pendingProjects = await projectService.getUserProjects(userId, { status: 'pending' });
      expect(pendingProjects).toHaveLength(2);

      const quotedProjects = await projectService.getUserProjects(userId, { status: 'quoted' });
      expect(quotedProjects).toHaveLength(1);
    });

    it('should filter projects by service type', async () => {
      const electricalProjects = await projectService.getUserProjects(userId, {
        serviceType: 'electrical',
      });

      expect(electricalProjects).toHaveLength(2);
      expect(electricalProjects.every((p) => p.serviceType === 'electrical')).toBe(true);
    });

    it('should return empty array for user with no projects', async () => {
      const newUser = await authService.registerUser({
        email: 'newuser@example.com',
        password: 'Password123',
      });

      const projects = await projectService.getUserProjects(newUser.user._id.toString());
      expect(projects).toHaveLength(0);
    });
  });

  describe('getProjectById', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await projectService.createProject({
        userId,
        serviceType: 'electrical',
        title: 'Test Project',
        description: 'Test Description',
      });
      projectId = project._id.toString();
    });

    it('should get project by id for owner', async () => {
      const project = await projectService.getProjectById(projectId, userId);

      expect(project).toBeTruthy();
      expect(project?._id.toString()).toBe(projectId);
      expect(project?.userId.toString()).toBe(userId);
    });

    it('should return null for project not owned by user', async () => {
      const otherUser = await authService.registerUser({
        email: 'other@example.com',
        password: 'Password123',
      });

      const project = await projectService.getProjectById(
        projectId,
        otherUser.user._id.toString()
      );

      expect(project).toBeNull();
    });

    it('should return null for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const project = await projectService.getProjectById(fakeId, userId);

      expect(project).toBeNull();
    });
  });

  describe('acceptQuote', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await projectService.createProject({
        userId,
        serviceType: 'electrical',
        title: 'Test Project',
        description: 'Test Description',
      });
      projectId = project._id.toString();

      // Set project to quoted status manually (since sendQuote was removed)
      const projectDoc = await Project.findById(projectId);
      if (projectDoc) {
        projectDoc.status = 'quoted';
        projectDoc.quoteAmount = 1000;
        projectDoc.quotedAt = new Date();
        await projectDoc.save();
      }
    });

    it('should accept quote successfully', async () => {
      const project = await projectService.acceptQuote(projectId, userId);

      expect(project.status).toBe('accepted');
    });

    it('should throw error if project not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(projectService.acceptQuote(fakeId, userId)).rejects.toThrow(
        'Project not found or quote already processed'
      );
    });

    it('should throw error if project not owned by user', async () => {
      const otherUser = await authService.registerUser({
        email: 'other@example.com',
        password: 'Password123',
      });

      await expect(projectService.acceptQuote(projectId, otherUser.user._id.toString())).rejects.toThrow(
        'Project not found or quote already processed'
      );
    });

    it('should throw error if project not in quoted status', async () => {
      // Accept quote first
      await projectService.acceptQuote(projectId, userId);

      // Try to accept again
      await expect(projectService.acceptQuote(projectId, userId)).rejects.toThrow(
        'Project not found or quote already processed'
      );
    });
  });

  describe('rejectQuote', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await projectService.createProject({
        userId,
        serviceType: 'electrical',
        title: 'Test Project',
        description: 'Test Description',
      });
      projectId = project._id.toString();

      // Set project to quoted status manually (since sendQuote was removed)
      const projectDoc = await Project.findById(projectId);
      if (projectDoc) {
        projectDoc.status = 'quoted';
        projectDoc.quoteAmount = 1000;
        projectDoc.quotedAt = new Date();
        await projectDoc.save();
      }
    });

    it('should reject quote successfully', async () => {
      const project = await projectService.rejectQuote(projectId, userId);

      expect(project.status).toBe('rejected');
    });

    it('should throw error if project not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(projectService.rejectQuote(fakeId, userId)).rejects.toThrow(
        'Project not found or quote already processed'
      );
    });
  });

});

