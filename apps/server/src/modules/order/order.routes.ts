import { Router } from 'express';
import type { IRouter } from 'express';
import { authenticate, requireAdmin } from '../../core/middleware/auth';
import { validateBody } from '../../core/middleware/validate';
import * as orderController from './order.controller';
import { createOrderSchema, updateOrderStatusSchema } from './order.schema';

const router: IRouter = Router();

router.use(authenticate);

router.post('/', validateBody(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id', requireAdmin, validateBody(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
