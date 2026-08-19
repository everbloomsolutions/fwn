import Bull, { Job, DoneCallback } from 'bull';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { config } from '../config';
import { logger } from '../middleware/logger';
import { TokenBlacklist } from '../../modules/auth/token-blacklist.model';

export interface CleanupJobData {
  type: 'tokens' | 'all';
}

let cleanupQueue: Bull.Queue<CleanupJobData> | null = null;

export const initializeCleanupQueue = (): void => {
  if (!isRedisConnected()) {
    logger.warn('Redis not connected. Cleanup queue will not be initialized.');
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    logger.warn('Redis client not available. Cleanup queue will not be initialized.');
    return;
  }

  try {
    cleanupQueue = new Bull<CleanupJobData>('cleanup', config.redisUrl);

    if (cleanupQueue) {
      cleanupQueue.process(async (job: Job<CleanupJobData>, done: DoneCallback) => {
      const { type } = job.data;

      logger.info(`Processing cleanup job ${job.id} for type: ${type}`);

      try {
        if (type === 'tokens' || type === 'all') {
          // Clean up expired tokens (MongoDB TTL should handle this, but we'll do a manual cleanup)
          const result = await TokenBlacklist.deleteMany({
            expiresAt: { $lt: new Date() },
          });

          logger.info(`Cleaned up ${result.deletedCount} expired tokens`);
        }

        done(null, { success: true });
      } catch (error) {
        logger.error(`Cleanup job ${job.id} failed:`, error);
        done(error as Error);
      }
      });

      cleanupQueue.on('completed', (job: Job<CleanupJobData>) => {
        logger.info(`Cleanup job ${job.id} completed`);
      });

      cleanupQueue.on('failed', (job: Job<CleanupJobData> | undefined, err: Error) => {
        logger.error(`Cleanup job ${job?.id} failed:`, err);
      });
    }

    logger.info('Cleanup queue initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize cleanup queue:', error);
    cleanupQueue = null;
  }
};

export const scheduleCleanup = async (type: CleanupJobData['type'] = 'all'): Promise<void> => {
  if (!cleanupQueue) {
    logger.warn('Cleanup queue not initialized.');
    return;
  }

  try {
    await cleanupQueue.add(
      { type },
      {
        repeat: {
          cron: '0 2 * * *', // Run daily at 2 AM
        },
      }
    );
  } catch (error) {
    logger.error('Failed to schedule cleanup job:', error);
  }
};

export const addCleanupJob = async (data: CleanupJobData): Promise<void> => {
  if (!cleanupQueue) {
    logger.warn('Cleanup queue not initialized.');
    return;
  }

  try {
    await cleanupQueue.add(data);
  } catch (error) {
    logger.error('Failed to add cleanup job:', error);
    throw error;
  }
};

export const getCleanupQueue = (): Bull.Queue<CleanupJobData> | null => {
  return cleanupQueue;
};

export const closeCleanupQueue = async (): Promise<void> => {
  if (cleanupQueue) {
    await cleanupQueue.close();
    cleanupQueue = null;
  }

  logger.info('Cleanup queue closed');
};

