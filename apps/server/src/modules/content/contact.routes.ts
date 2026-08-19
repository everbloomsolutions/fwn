/**
 * Contact routes
 */

import { Router } from 'express';
import type { IRouter } from 'express';
import { contactController } from './contact.controller';
import { validateBody } from '../../core/middleware/validate';
import { contactSchema } from './contact.schema';
import { contactFormRateLimiter } from '../../core/middleware/rateLimit';

const router: IRouter = Router();

// Contact form submission (public endpoint with rate limiting)
router.post(
  '/',
  contactFormRateLimiter,
  validateBody(contactSchema),
  contactController.submitContact
);

export default router;

