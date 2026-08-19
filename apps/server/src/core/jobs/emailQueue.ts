import Bull, { Job, DoneCallback } from 'bull';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { config } from '../config';
import { logger } from '../middleware/logger';
import { sendEmail } from '../utils/emailService';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let emailQueue: Bull.Queue<EmailJobData> | null = null;

export const initializeEmailQueue = (): void => {
  if (!isRedisConnected()) {
    logger.warn('Redis not connected. Email queue will not be initialized.');
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    logger.warn('Redis client not available. Email queue will not be initialized.');
    return;
  }

  try {
    emailQueue = new Bull<EmailJobData>('email', config.redisUrl);

    if (emailQueue) {
      emailQueue.process(async (job: Job<EmailJobData>, done: DoneCallback) => {
      const { to, subject, html, text } = job.data;

      logger.info(`Processing email job ${job.id} to ${to}`);

      try {
        await sendEmail({
          to,
          subject,
          html,
          text,
        });

        logger.info(`Email sent successfully to ${to}`);
        done(null, { success: true });
      } catch (error) {
        logger.error(`Failed to send email to ${to}:`, error);
        done(error as Error);
      }
      });

      emailQueue.on('completed', (job: Job<EmailJobData>) => {
        logger.info(`Email job ${job.id} completed`);
      });

      emailQueue.on('failed', (job: Job<EmailJobData> | undefined, err: Error) => {
        logger.error(`Email job ${job?.id} failed:`, err);
      });
    }

    logger.info('Email queue initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize email queue:', error);
    emailQueue = null;
  }
};

export const addEmailJob = async (data: EmailJobData): Promise<void> => {
  if (!emailQueue) {
    logger.warn('Email queue not initialized. Sending email directly.');
    try {
      await sendEmail({
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      });
    } catch (error) {
      logger.error('Failed to send email directly:', error);
      throw error;
    }
    return;
  }

  try {
    await emailQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  } catch (error) {
    logger.error('Failed to add email job:', error);
    throw error;
  }
};

export const getEmailQueue = (): Bull.Queue<EmailJobData> | null => {
  return emailQueue;
};

export const closeEmailQueue = async (): Promise<void> => {
  if (emailQueue) {
    await emailQueue.close();
    emailQueue = null;
  }

  logger.info('Email queue closed');
};

