import { Router, type IRouter } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../../core/middleware/auth';
import { validateQuery } from '../../core/middleware/validate';
import { notificationQuerySchema } from './notification.schema';

const router: IRouter = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', validateQuery(notificationQuerySchema), notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;

