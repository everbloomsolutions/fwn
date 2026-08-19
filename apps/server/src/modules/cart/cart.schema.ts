import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().min(2, 'Product ID is required'),
  variantId: z.string().min(2, 'Variant ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be at least 0'),
});
