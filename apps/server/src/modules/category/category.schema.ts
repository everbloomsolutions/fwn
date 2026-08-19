import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().max(1000).optional(),
  image: z.string().url('Image must be a valid URL').optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
