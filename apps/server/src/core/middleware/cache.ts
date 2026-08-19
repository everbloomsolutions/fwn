import { Request, Response, NextFunction } from 'express';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { logger } from './logger';

/**
 * Cache middleware for route-level caching
 * @param duration Cache duration in seconds (default: 300 = 5 minutes)
 * @param keyGenerator Optional function to generate custom cache key
 */
export const cache = (
  duration: number = 300,
  keyGenerator?: (req: Request) => string
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    if (!isRedisConnected()) {
      return next();
    }

    const redis = getRedisClient();
    if (!redis) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;

      // Try to get cached response
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        res.status(200).json(parsed);
        return;
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = function (body: unknown): Response {
        // Cache the response
        redis
          .setEx(cacheKey, duration, JSON.stringify(body))
          .catch((err) => {
            logger.error('Error caching response:', err);
          });

        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
  const redis = getRedisClient();
  if (!redis || !isRedisConnected()) {
    return;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    logger.error('Error invalidating cache:', error);
  }
};

/**
 * Clear all cache
 */
export const clearCache = async (): Promise<void> => {
  const redis = getRedisClient();
  if (!redis || !isRedisConnected()) {
    return;
  }

  try {
    const keys = await redis.keys('cache:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    logger.error('Error clearing cache:', error);
  }
};

