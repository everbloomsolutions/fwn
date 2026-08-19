import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(2, 'SKU is required'),
  name: z.string().min(2, 'Name is required').max(200),
  slug: z.string().min(2, 'Slug is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(10, 'Description is required').max(5000),
  price: z.number().min(0, 'Price must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  images: z.array(z.string().url('Image must be a valid URL')).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  nutrition: z.record(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

export const updateProductSchema = createProductSchema.partial();
