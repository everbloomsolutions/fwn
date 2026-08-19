import createApp from './core/http/app';
import { config } from './core/config';
import { logger } from './core/middleware/logger';
import { connectDatabase, disconnectDatabase } from './core/db/database';
import { connectRedis, disconnectRedis } from './core/config/redis';
import { initializeScheduler, closeScheduler } from './core/utils/scheduler';
import { verifyEmailConfig } from './core/utils/emailService';
import mongoose from 'mongoose';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    logger.info('Connecting to MongoDB...');
    await connectDatabase();
    logger.info('MongoDB connection completed');

    // Connect to Redis (non-blocking - will continue even if Redis fails)
    logger.info('Connecting to Redis...');
    const redisPromise = connectRedis().catch((err) => {
      logger.warn('Redis connection failed, continuing without cache:', err);
    });
    
    // Add timeout to prevent hanging
    const redisTimeout = new Promise((resolve) => {
      setTimeout(() => {
        logger.warn('Redis connection timeout, continuing without cache');
        resolve(null);
      }, 5000); // 5 second timeout
    });
    
    await Promise.race([redisPromise, redisTimeout]);
    logger.info('Redis connection attempt completed');

    // Initialize job queues (non-blocking)
    logger.info('Initializing scheduler...');
    const schedulerPromise = initializeScheduler().catch((err) => {
      logger.warn('Scheduler initialization failed:', err);
    });
    
    // Add timeout to prevent hanging
    const schedulerTimeout = new Promise((resolve) => {
      setTimeout(() => {
        logger.warn('Scheduler initialization timeout, continuing');
        resolve(null);
      }, 3000); // 3 second timeout
    });
    
    await Promise.race([schedulerPromise, schedulerTimeout]);
    logger.info('Scheduler initialization completed');

    // Verify email configuration (non-blocking)
    logger.info('Verifying email configuration...');
    verifyEmailConfig().catch((err) => {
      logger.warn('Email configuration verification failed (will continue):', err);
    });

    // Create and start server
    logger.info('Creating Express app...');
    const app = createApp();
    logger.info('Express app created successfully');
    
    logger.info(`Starting server on ${config.host}:${config.port}...`);
    const server = app.listen(config.port, config.host, () => {
      logger.info(`✅ Server running on http://${config.host}:${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
    
    // Handle server errors
    server.on('error', (error: Error & { code?: string }) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use. Please use a different port.`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('Server closed');
        
        // Close database connection
        if (mongoose.connection.readyState === 1) {
          await disconnectDatabase();
        }

        // Close Redis connection
        await disconnectRedis().catch((err) => {
          logger.warn('Error disconnecting Redis:', err);
        });

        // Close job queues
        await closeScheduler().catch((err) => {
          logger.warn('Error closing scheduler:', err);
        });
        
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    logger.error('Error details:', error);
    process.exit(1);
  }
};

startServer();
