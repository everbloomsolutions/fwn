import * as admin from 'firebase-admin';
import { getFirebaseApp, isFirebaseInitialized } from '../config/firebase';
import { logger } from '../middleware/logger';

export interface FCMMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface FCMOptions {
  priority?: 'normal' | 'high';
  sound?: string;
  badge?: number;
}

/**
 * Send a push notification to a single device
 */
export const sendToDevice = async (
  deviceToken: string,
  message: FCMMessage,
  options?: FCMOptions
): Promise<string | null> => {
  if (!isFirebaseInitialized()) {
    logger.warn('Firebase not initialized. Push notification not sent.');
    return null;
  }

  const app = getFirebaseApp();
  if (!app) {
    logger.warn('Firebase app not available. Push notification not sent.');
    return null;
  }

  try {
    const messaging = admin.messaging(app);

    const payload: admin.messaging.Message = {
      token: deviceToken,
      notification: {
        title: message.title,
        body: message.body,
        imageUrl: message.imageUrl,
      },
      data: message.data ? Object.fromEntries(
        Object.entries(message.data).map(([key, value]) => [key, String(value)])
      ) : undefined,
      android: {
        priority: options?.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: options?.sound || 'default',
          ...(options?.badge && { notificationCount: options.badge }),
        },
      },
      apns: {
        payload: {
          aps: {
            sound: options?.sound || 'default',
            ...(options?.badge && { badge: options.badge }),
          },
        },
      },
    };

    const response = await messaging.send(payload);
    logger.debug('Successfully sent push notification:', response);
    return response;
  } catch (error) {
    logger.error('Error sending push notification:', error);
    // Don't throw - allow the app to continue even if push fails
    return null;
  }
};

/**
 * Send push notifications to multiple devices
 */
export const sendToMultipleDevices = async (
  deviceTokens: string[],
  message: FCMMessage,
  options?: FCMOptions
): Promise<admin.messaging.BatchResponse | null> => {
  if (!isFirebaseInitialized()) {
    logger.warn('Firebase not initialized. Push notifications not sent.');
    return null;
  }

  const app = getFirebaseApp();
  if (!app) {
    logger.warn('Firebase app not available. Push notifications not sent.');
    return null;
  }

  if (deviceTokens.length === 0) {
    return null;
  }

  try {
    const messaging = admin.messaging(app);

    const payload: admin.messaging.MulticastMessage = {
      tokens: deviceTokens,
      notification: {
        title: message.title,
        body: message.body,
        imageUrl: message.imageUrl,
      },
      data: message.data ? Object.fromEntries(
        Object.entries(message.data).map(([key, value]) => [key, String(value)])
      ) : undefined,
      android: {
        priority: options?.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: options?.sound || 'default',
          ...(options?.badge && { notificationCount: options.badge }),
        },
      },
      apns: {
        payload: {
          aps: {
            sound: options?.sound || 'default',
            ...(options?.badge && { badge: options.badge }),
          },
        },
      },
    };

    const response = await messaging.sendEachForMulticast(payload);
    logger.debug(`Successfully sent ${response.successCount} push notifications`);
    if (response.failureCount > 0) {
      logger.warn(`Failed to send ${response.failureCount} push notifications`);
    }
    return response;
  } catch (error) {
    logger.error('Error sending push notifications:', error);
    return null;
  }
};

/**
 * Send push notification to a topic
 */
export const sendToTopic = async (
  topic: string,
  message: FCMMessage,
  options?: FCMOptions
): Promise<string | null> => {
  if (!isFirebaseInitialized()) {
    logger.warn('Firebase not initialized. Push notification not sent.');
    return null;
  }

  const app = getFirebaseApp();
  if (!app) {
    logger.warn('Firebase app not available. Push notification not sent.');
    return null;
  }

  try {
    const messaging = admin.messaging(app);

    const payload: admin.messaging.Message = {
      topic,
      notification: {
        title: message.title,
        body: message.body,
        imageUrl: message.imageUrl,
      },
      data: message.data ? Object.fromEntries(
        Object.entries(message.data).map(([key, value]) => [key, String(value)])
      ) : undefined,
      android: {
        priority: options?.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: options?.sound || 'default',
          ...(options?.badge && { notificationCount: options.badge }),
        },
      },
      apns: {
        payload: {
          aps: {
            sound: options?.sound || 'default',
            ...(options?.badge && { badge: options.badge }),
          },
        },
      },
    };

    const response = await messaging.send(payload);
    logger.debug('Successfully sent push notification to topic:', response);
    return response;
  } catch (error) {
    logger.error('Error sending push notification to topic:', error);
    return null;
  }
};

