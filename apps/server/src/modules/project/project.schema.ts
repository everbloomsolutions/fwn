import { z } from 'zod';

export const createProjectSchema = z.object({
  serviceType: z.enum(['cctv', 'access-control', 'fire-safety', 'networking', 'home-automation', 'other']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  location: z.object({
    address: z.string().min(5, 'Address is required'),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export const acceptQuoteSchema = z.object({
  notes: z.string().optional(),
});

