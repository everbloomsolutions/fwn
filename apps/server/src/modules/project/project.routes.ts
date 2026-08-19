/**
 * Project routes - Customer endpoints
 */

import { Router } from 'express';
import type { IRouter } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { validateBody } from '../../core/middleware/validate';
import * as projectController from './project.controller';
import { createProjectSchema } from './project.schema';

const router: IRouter = Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', validateBody(createProjectSchema), projectController.createProject);
router.get('/', projectController.getUserProjects);
router.get('/:id', projectController.getProjectById);
router.post('/:id/accept-quote', projectController.acceptQuote);
router.post('/:id/reject-quote', projectController.rejectQuote);

export default router;

