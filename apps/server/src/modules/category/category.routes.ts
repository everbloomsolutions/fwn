import { Router } from 'express';
import type { IRouter } from 'express';
import { authenticate, requireAdmin } from '../../core/middleware/auth';
import { validateBody } from '../../core/middleware/validate';
import * as categoryController from './category.controller';
import { createCategorySchema, updateCategorySchema } from './category.schema';

const router: IRouter = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin routes
router.post('/', authenticate, requireAdmin, validateBody(createCategorySchema), categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, validateBody(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

export default router;
