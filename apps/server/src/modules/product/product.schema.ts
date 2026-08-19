import { z } from 'zod';

const productVariantSchema = z.object({
  _id: z.string().optional(),
  sku: z.string().min(2, 'Variant SKU is required'),
  unit: z.string().min(1, 'Unit is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  stock: z.number().min(0, 'Stock must be non-negative').default(0),
  mrp: z.number().min(0).optional(),
  isActive: z.boolean().optional().default(true),
  position: z.number().optional().default(0),
});

export const createProductSchema = z.object({
  sku: z.string().min(2, 'SKU is required'),
  name: z.string().min(2, 'Name is required').max(200),
  slug: z.string().min(2, 'Slug is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(10, 'Description is required').max(5000),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  stock: z.number().min(0, 'Stock must be non-negative').optional(),
  images: z.array(z.string().url('Image must be a valid URL')).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  nutrition: z.record(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).min(1, 'At least one variant is required'),
});

export const updateProductSchema = createProductSchema.partial();
