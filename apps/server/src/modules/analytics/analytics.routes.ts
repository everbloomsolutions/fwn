import { Router, type IRouter } from 'express';
import { analyticsController } from './analytics.controller';
import { validateBody } from '../../core/middleware/validate';
import { createAnalyticsEventSchema } from './analytics.schema';

const router: IRouter = Router();

// Public route for creating events (no auth required for analytics)
router.post('/events', validateBody(createAnalyticsEventSchema), analyticsController.createEvent);

export default router;

