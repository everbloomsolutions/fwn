import { Router } from 'express';
import type { IRouter } from 'express';
import { authenticate, requireAdmin } from '../../core/middleware/auth';
import { validateBody } from '../../core/middleware/validate';
import * as productController from './product.controller';
import { createProductSchema, updateProductSchema, updateInventorySchema } from './product.schema';

const router: IRouter = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);

// Admin routes
router.get('/admin/:id', authenticate, requireAdmin, productController.getProductById);
router.post('/', authenticate, requireAdmin, validateBody(createProductSchema), productController.createProduct);
router.put('/:id', authenticate, requireAdmin, validateBody(updateProductSchema), productController.updateProduct);
router.patch('/:id/inventory', authenticate, requireAdmin, validateBody(updateInventorySchema), productController.updateProductInventory);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

export default router;
