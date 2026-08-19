import { createClient, RedisClientType } from 'redis';
import { config, isDevelopment } from './index';
import { logger } from '../middleware/logger';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<void> => {
  if (redisClient?.isOpen) {
    return;
  }

  try {
    redisClient = createClient({
      url: config.redisUrl,
    });

    // Only log errors if client was previously connected (connection lost)
    // Initial connection errors are handled in the catch block below
    let isInitialConnection = true;
    
    redisClient.on('error', (err) => {
      // Only log as error if we were previously connected
      // Initial connection failures are expected and handled gracefully
      if (!isInitialConnection) {
        logger.error('Redis Client Error:', err);
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connecting...');
      isInitialConnection = false;
    });

    redisClient.on('ready', () => {
      logger.info('Redis client connected and ready');
      isInitialConnection = false;
    });

    redisClient.on('end', () => {
      logger.info('Redis client connection ended');
    });

    // Add connection timeout
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Redis connection timeout after 5 seconds'));
      }, 5000);
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    isInitialConnection = false;
  } catch (error) {
    // Redis is optional - log as warning, not error, for development
    if (isDevelopment) {
      logger.warn('Redis not available (optional):', (error as Error).message);
      logger.warn('Server will continue without caching and background jobs.');
      logger.warn('To enable Redis, start it with: podman run -d -p 6379:6379 redis:7-alpine');
    } else {
      logger.warn('Redis connection failed, continuing without cache:', error);
    }
    redisClient = null;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis client disconnected');
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const isRedisConnected = (): boolean => {
  return redisClient?.isOpen ?? false;
};

