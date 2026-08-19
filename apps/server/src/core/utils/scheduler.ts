import { initializeEmailQueue, closeEmailQueue } from '../jobs/emailQueue';
import { initializeCleanupQueue, scheduleCleanup, closeCleanupQueue } from '../jobs/cleanupJob';
import { initializeAnalyticsQueue, closeAnalyticsQueue } from '../jobs/analyticsJob';
import { logger } from '../middleware/logger';

/**
 * Initialize all job queues
 */
export const initializeScheduler = async (): Promise<void> => {
  try {
    logger.info('Initializing job queues...');

    // Initialize email queue
    initializeEmailQueue();

    // Initialize cleanup queue and schedule recurring cleanup
    initializeCleanupQueue();
    await scheduleCleanup('all').catch((err) => {
      logger.warn('Failed to schedule cleanup job:', err);
    });

    // Initialize analytics queue
    initializeAnalyticsQueue();

    logger.info('All job queues initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize scheduler:', error);
  }
};

/**
 * Close all job queues gracefully
 */
export const closeScheduler = async (): Promise<void> => {
  try {
    logger.info('Closing job queues...');

    await Promise.all([
      closeEmailQueue(),
      closeCleanupQueue(),
      closeAnalyticsQueue(),
    ]);

    logger.info('All job queues closed');
  } catch (error) {
    logger.error('Error closing scheduler:', error);
  }
};

