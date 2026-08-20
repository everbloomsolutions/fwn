import { Router } from 'express';
import type { IRouter } from 'express';
import { optionalAuthenticate, requireAdmin } from '../../core/middleware/auth';
import { validateBody } from '../../core/middleware/validate';
import * as orderController from './order.controller';
import { createOrderSchema, updateOrderStatusSchema, bulkUpdateOrderStatusSchema } from './order.schema';

const router: IRouter = Router();

router.use(optionalAuthenticate);

router.post('/', validateBody(createOrderSchema), orderController.createOrder);
router.get('/track', orderController.trackOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id', requireAdmin, validateBody(updateOrderStatusSchema), orderController.updateOrderStatus);
router.patch('/bulk', requireAdmin, validateBody(bulkUpdateOrderStatusSchema), orderController.bulkUpdateOrderStatus);
router.patch('/payment/confirm', orderController.updatePayment);

export default router;
