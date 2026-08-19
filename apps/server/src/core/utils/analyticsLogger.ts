import { addAnalyticsJob } from '../jobs/analyticsJob';
import { logger } from '../middleware/logger';

export interface LogAnalyticsEventOptions {
  eventType: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
}

/**
 * Log an analytics event asynchronously via job queue
 */
export const logAnalyticsEvent = async (options: LogAnalyticsEventOptions): Promise<void> => {
  try {
    await addAnalyticsJob({
      eventType: options.eventType,
      userId: options.userId,
      properties: options.properties,
      timestamp: new Date(),
    });
  } catch (error) {
    // Don't throw - analytics failures shouldn't break the app
    logger.error('Failed to log analytics event:', error);
  }
};

/**
 * Log a user action event
 */
export const logUserAction = async (
  action: string,
  userId: string,
  properties?: Record<string, unknown>
): Promise<void> => {
  await logAnalyticsEvent({
    eventType: 'user_action',
    userId,
    properties: {
      action,
      ...properties,
    },
  });
};

