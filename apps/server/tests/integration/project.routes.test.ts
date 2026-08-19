import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { setupTestDB, cleanupTestDB, closeTestDB } from '../setup';
import createApp from '../../src/core/http/app';
import { createTestUser, createTestProject } from '../utils/testHelpers';
import { Project } from '../../src/modules/project/project.model';

const app = createApp();

describe('Project Routes', () => {
  let userToken: string;
  let userId: string;
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await cleanupTestDB();

    const user = await createTestUser({ email: 'user@example.com', name: 'Test User' });
    userToken = user.token;
    userId = user._id;

    const admin = await createTestUser({ email: 'admin@example.com', name: 'Admin', role: 'admin' });
    adminToken = admin.token;
    adminId = admin._id;
  });

  afterEach(async () => {
    await cleanupTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          serviceType: 'electrical',
          title: 'Test Project',
          description: 'Test Description',
          location: {
            address: '123 Test St',
            city: 'Test City',
          },
          priority: 'high',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.serviceType).toBe('electrical');
      expect(response.body.data.title).toBe('Test Project');
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/projects')
        .send({
          serviceType: 'electrical',
          title: 'Test Project',
          description: 'Test Description',
        })
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          serviceType: 'invalid',
          title: '',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/projects', () => {
    beforeEach(async () => {
      await createTestProject(userId, { title: 'Project 1', serviceType: 'electrical' });
      await createTestProject(userId, { title: 'Project 2', serviceType: 'cctv' });
    });

    it('should get user projects', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter projects by status', async () => {
      const project = await createTestProject(userId, { status: 'quoted' });

      const response = await request(app)
        .get('/api/v1/projects?status=quoted')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.every((p: { status: string }) => p.status === 'quoted')).toBe(true);
    });

    it('should filter projects by service type', async () => {
      const response = await request(app)
        .get('/api/v1/projects?serviceType=electrical')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((p: { serviceType: string }) => p.serviceType === 'electrical')).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/projects')
        .expect(401);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await createTestProject(userId, { title: 'Test Project' });
      projectId = project._id.toString();
    });

    it('should get project by id', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(projectId);
      expect(response.body.data.title).toBe('Test Project');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .get(`/api/v1/projects/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 404 for project owned by another user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherProject = await createTestProject(otherUser._id);

      await request(app)
        .get(`/api/v1/projects/${otherProject._id.toString()}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/projects/:id/accept-quote', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await createTestProject(userId, { status: 'pending' });
      projectId = project._id.toString();

      // Set project to quoted status
      await Project.findByIdAndUpdate(projectId, {
        status: 'quoted',
        quoteAmount: 1000,
        quotedBy: new mongoose.Types.ObjectId(adminId),
      });
    });

    it('should accept quote successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/accept-quote`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
    });

    it('should return 404 if project not in quoted status', async () => {
      await Project.findByIdAndUpdate(projectId, { status: 'pending' });

      await request(app)
        .post(`/api/v1/projects/${projectId}/accept-quote`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/projects/:id/reject-quote', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await createTestProject(userId, { status: 'pending' });
      projectId = project._id.toString();

      await Project.findByIdAndUpdate(projectId, {
        status: 'quoted',
        quoteAmount: 1000,
        quotedBy: new mongoose.Types.ObjectId(adminId),
      });
    });

    it('should reject quote successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/reject-quote`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('rejected');
    });
  });
});

