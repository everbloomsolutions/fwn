import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import helmet from 'helmet';
import { config, isProduction } from '../config';
import { requestLogger } from '../middleware/logger';
import { errorHandler, notFoundHandler } from '../exceptions/errorHandler';
import { conditionalCompression } from '../middleware/compression';
import { sanitizeMiddleware } from '../middleware/sanitize';
import authRoutes from '../../modules/auth/auth.routes';
import userRoutes from '../../modules/user/user.routes';
import contactRoutes from '../../modules/content/contact.routes';
import projectRoutes from '../../modules/project/project.routes';
import productRoutes from '../../modules/product/product.routes';
import categoryRoutes from '../../modules/category/category.routes';
import orderRoutes from '../../modules/order/order.routes';
import notificationRoutes from '../../modules/notification/notification.routes';
import analyticsRoutes from '../../modules/analytics/analytics.routes';
import '../config/passport';
import { initializeFirebase } from '../config/firebase';
import { initializeCloudinary } from '../config/cloudinary';

// Request size limits
const REQUEST_SIZE_LIMIT = '1mb';

const createApp = (): Express => {
  const app = express();

  // Trust proxy for rate limiting (important for IP detection behind reverse proxy)
  app.set('trust proxy', 1);

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false, // Disable CSP in dev for easier debugging
    crossOriginEmbedderPolicy: false, // Disable for OAuth compatibility
  }));

  // HTTPS enforcement in production
  if (isProduction) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.header('x-forwarded-proto') !== 'https') {
        return res.redirect(301, `https://${req.header('host')}${req.url}`);
      }
      // Add HSTS header
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      next();
    });
  }

  // CORS configuration
  // Handle multiple origins properly - CORS origin must be a function or array, not comma-separated string
  const corsOrigin = config.corsOrigin || '*';
  const allowedOrigins = typeof corsOrigin === 'string' && corsOrigin.includes(',')
    ? corsOrigin.split(',').map(origin => origin.trim())
    : corsOrigin === '*' ? '*' : [corsOrigin];
  
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // If wildcard is set, allow all origins
      if (allowedOrigins === '*' || (Array.isArray(allowedOrigins) && allowedOrigins.includes('*'))) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // If single string (not array), check exact match
      if (typeof allowedOrigins === 'string' && allowedOrigins === origin) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  };
  app.use(cors(corsOptions));

  // Body parsing with size limits
  app.use(express.json({ limit: REQUEST_SIZE_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: REQUEST_SIZE_LIMIT }));
  
  // Compression middleware
  app.use(conditionalCompression);
  
  // Input sanitization
  app.use(sanitizeMiddleware);
  
  app.use(passport.initialize());
  app.use(requestLogger);

  // Health check endpoint
  app.get('/health', async (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    // Try to get more detailed database status
    let dbStatus = dbStates[dbState as keyof typeof dbStates] || 'unknown';
    let dbError: string | undefined;
    
    // If disconnected, check if MONGODB_URI is set
    if (dbState === 0) {
      if (!config.mongodbUri) {
        dbError = 'MONGODB_URI not configured';
        dbStatus = 'not configured';
      } else {
        dbError = 'Database connection not established. Check Vercel logs for connection errors.';
      }
    }
    
    const health = {
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: {
        status: dbStatus,
        readyState: dbState,
        ...(dbError && { error: dbError }),
        ...(dbState === 1 && {
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
        }),
      },
      ...(config.mongodbUri && {
        mongodbUri: config.mongodbUri.substring(0, 20) + '...' + config.mongodbUri.substring(config.mongodbUri.length - 10),
      }),
    };
    
    // Return 200 even if DB is disconnected (health check should still work)
    // But include status so monitoring can detect issues
    res.status(dbState === 1 ? 200 : 200).json(health);
  });

  // API info endpoint
  app.get('/api/v1', (_req, res) => {
    res.json({
      success: true,
      message: 'Foodworld Naturals API v1',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        profile: '/api/v1/profile',
        contact: '/api/v1/contact',
        projects: '/api/v1/projects',
        categories: '/api/v1/categories',
        products: '/api/v1/products',
        orders: '/api/v1/orders',
        notifications: '/api/v1/notifications',
        analytics: '/api/v1/analytics',
      },
      health: '/health',
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/profile', userRoutes);
  app.use('/api/v1/contact', contactRoutes);
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);

  // Initialize Firebase for push notifications
  initializeFirebase();

  // Initialize Cloudinary for image uploads
  initializeCloudinary();

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome to the Foodworld Naturals API',
    });
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;

