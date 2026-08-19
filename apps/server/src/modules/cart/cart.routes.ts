import { Router } from 'express';
import type { IRouter } from 'express';
import { optionalAuthenticate } from '../../core/middleware/auth';
import { validateBody } from '../../core/middleware/validate';
import * as cartController from './cart.controller';
import { addCartItemSchema, updateCartItemSchema } from './cart.schema';

const router: IRouter = Router();

router.use(optionalAuthenticate);

router.get('/', cartController.getCart);
router.post('/items', validateBody(addCartItemSchema), cartController.addItem);
router.patch('/items/:variantId', validateBody(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:variantId', cartController.removeItem);
router.delete('/', cartController.clearCartItems);

export default router;
