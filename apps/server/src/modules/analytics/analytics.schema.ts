import { z } from 'zod';

export const createAnalyticsEventSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  properties: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
});

export const analyticsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  eventType: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

