/**
 * Vercel Serverless Function Handler
 * 
 * This file exports the Express app as a serverless function for Vercel.
 * Vercel automatically compiles TypeScript and detects Express framework.
 */

// Import express - required for Vercel framework detection
import express from 'express';

// Import Express type for type annotations
import type { Express } from 'express';

// Import mongoose for connection state checking
import mongoose from 'mongoose';

// Import application factory and initialization functions
import createApp from '../src/core/http/app';
import { connectDatabase } from '../src/core/db/database';
import { connectRedis } from '../src/core/config/redis';
import { initializeScheduler } from '../src/core/utils/scheduler';
import { initializeFirebase } from '../src/core/config/firebase';
import { initializeCloudinary } from '../src/core/config/cloudinary';
import { logger } from '../src/core/middleware/logger';

// Reference express import to ensure it's recognized as used
// This satisfies TypeScript while allowing Vercel to detect Express framework
const _expressImport: typeof express = express;
void _expressImport;

// Connection state management
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize database and services
 * This function is idempotent and safe to call multiple times
 */
async function initializeServices(): Promise<void> {
  // Return immediately if already initialized
  if (isInitialized) {
    return;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      logger.info('Initializing serverless function services...', {
        mongodbUri: process.env.MONGODB_URI ? '***configured***' : 'NOT SET',
      });

      // Connect to MongoDB (critical - must succeed)
      await connectDatabase();

      // Verify MongoDB connection is ready
      if (mongoose.connection.readyState !== 1) {
        throw new Error(
          `MongoDB connection not ready. State: ${mongoose.connection.readyState}`
        );
      }

      logger.info('✅ MongoDB connected successfully');

      // Initialize optional services (non-blocking)
      connectRedis().catch((err: Error) => {
        logger.warn('Redis connection failed, continuing without cache:', {
          error: err.message,
        });
      });

      initializeScheduler().catch((err: Error) => {
        logger.warn('Scheduler initialization failed:', {
          error: err.message,
        });
      });

      // Initialize Firebase and Cloudinary (safe to call multiple times)
      initializeFirebase();
      initializeCloudinary();

      isInitialized = true;
      logger.info('✅ Serverless function services initialized');
    } catch (error) {
      logger.error('Failed to initialize serverless function:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        mongodbUri: process.env.MONGODB_URI ? '***configured***' : 'NOT SET',
      });
      // Reset promise on error so retry is possible
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

// Create Express application instance
const app: Express = createApp();

// Middleware: Ensure database is connected before processing requests
app.use(async (req, res, next) => {
  try {
    // Health check endpoint - allow without blocking
    if (req.path === '/health') {
      // Try to initialize in background if not already connected
      if (mongoose.connection.readyState !== 1 && !initializationPromise) {
        initializeServices().catch((err) => {
          logger.warn('Health check: Background initialization failed:', {
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        });
      }
      return next();
    }

    // All other endpoints require database connection
    await initializeServices();

    // Verify connection is ready
    if (mongoose.connection.readyState !== 1) {
      logger.error('Database connection not ready for request', {
        readyState: mongoose.connection.readyState,
        path: req.path,
        method: req.method,
      });
      throw new Error(
        `Database connection not ready. State: ${mongoose.connection.readyState}`
      );
    }

    next();
  } catch (error) {
    logger.error('Request handler initialization failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      path: req.path,
      method: req.method,
    });

    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Database connection failed.',
      error:
        process.env.NODE_ENV === 'development'
          ? error instanceof Error
            ? error.message
            : 'Unknown error'
          : undefined,
    });
  }
});

// Start initialization in background (non-blocking)
// This helps establish connections before first request arrives
initializeServices().catch((err) => {
  logger.error('Background initialization failed:', {
    error: err instanceof Error ? err.message : 'Unknown error',
  });
});

// Export Express app as Vercel serverless function handler
export default app;
