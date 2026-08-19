import Bull, { Job, DoneCallback } from 'bull';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { config } from '../config';
import { logger } from '../middleware/logger';

export interface AnalyticsJobData {
  eventType: string;
  userId?: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
}

let analyticsQueue: Bull.Queue<AnalyticsJobData> | null = null;

export const initializeAnalyticsQueue = (): void => {
  if (!isRedisConnected()) {
    logger.warn('Redis not connected. Analytics queue will not be initialized.');
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    logger.warn('Redis client not available. Analytics queue will not be initialized.');
    return;
  }

  try {
    analyticsQueue = new Bull<AnalyticsJobData>('analytics', config.redisUrl);

    if (analyticsQueue) {
      analyticsQueue.process(async (job: Job<AnalyticsJobData>, done: DoneCallback) => {
      const { eventType, userId, properties, timestamp } = job.data;

      logger.info(`Processing analytics job ${job.id} for event: ${eventType}`);

      try {
        // Here you would process the analytics event
        // For now, we'll just log it. In a real implementation, you would:
        // 1. Store the event in the database
        // 2. Aggregate analytics data
        // 3. Update analytics dashboards
        // 4. Send to external analytics services

        logger.debug('Analytics event:', {
          eventType,
          userId,
          properties,
          timestamp,
        });

        // TODO: Implement actual analytics processing
        // This is a placeholder for future implementation

        done(null, { success: true });
      } catch (error) {
        logger.error(`Analytics job ${job.id} failed:`, error);
        done(error as Error);
      }
      });

      analyticsQueue.on('completed', (job: Job<AnalyticsJobData>) => {
        logger.debug(`Analytics job ${job.id} completed`);
      });

      analyticsQueue.on('failed', (job: Job<AnalyticsJobData> | undefined, err: Error) => {
        logger.error(`Analytics job ${job?.id} failed:`, err);
      });
    }

    logger.info('Analytics queue initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize analytics queue:', error);
    analyticsQueue = null;
  }
};

export const addAnalyticsJob = async (data: AnalyticsJobData): Promise<void> => {
  if (!analyticsQueue) {
    logger.warn('Analytics queue not initialized. Event will not be processed.');
    return;
  }

  try {
    await analyticsQueue.add(data, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  } catch (error) {
    logger.error('Failed to add analytics job:', error);
    // Don't throw - analytics failures shouldn't break the app
  }
};

export const getAnalyticsQueue = (): Bull.Queue<AnalyticsJobData> | null => {
  return analyticsQueue;
};

export const closeAnalyticsQueue = async (): Promise<void> => {
  if (analyticsQueue) {
    await analyticsQueue.close();
    analyticsQueue = null;
  }

  logger.info('Analytics queue closed');
};

