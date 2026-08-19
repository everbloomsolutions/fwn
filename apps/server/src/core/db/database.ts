import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../middleware/logger';

export const connectDatabase = async (): Promise<void> => {
  // Detect MongoDB connection type (declare outside try for error handling)
  let isAtlas = false;
  let isSelfHosted = false;
  
  try {
    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB already connected');
      return;
    }

    // Detect MongoDB connection type
    isAtlas = config.mongodbUri.startsWith('mongodb+srv://');
    isSelfHosted = config.mongodbUri.startsWith('mongodb://');
    
    // Log connection type
    if (isAtlas) {
      logger.info('Detected MongoDB Atlas connection string (mongodb+srv://)');
    } else if (isSelfHosted) {
      logger.info('Detected self-hosted MongoDB connection string (mongodb://)');
    } else {
      logger.warn('Unknown MongoDB connection string format:', {
        uriPrefix: config.mongodbUri.substring(0, 20) + '...',
      });
    }
    
    // Check if connection string already has TLS/SSL options
    const uriHasTlsOptions = config.mongodbUri.includes('tls=') || 
                             config.mongodbUri.includes('ssl=') ||
                             config.mongodbUri.includes('tlsAllowInvalidCertificates=');

    // ============================================
    // Mongoose-specific configuration options
    // These are set globally on mongoose, not passed to connect()
    // ============================================
    
    // Disable command buffering - prevents operations from queuing when disconnected
    // This is critical for serverless functions where connections may be cold
    const bufferCommands = process.env.MONGOOSE_BUFFER_COMMANDS === 'true' ? true : false;
    mongoose.set('bufferCommands', bufferCommands);
    
    // Additional Mongoose options
    mongoose.set('strictQuery', process.env.MONGOOSE_STRICT_QUERY !== 'false'); // Default: true
    mongoose.set('strictPopulate', process.env.MONGOOSE_STRICT_POPULATE !== 'false'); // Default: true

    // ============================================
    // MongoDB driver connection options
    // These are passed directly to mongoose.connect() and forwarded to MongoDB driver
    // ============================================
    
    // Build TLS options based on connection type
    const tlsOptions: Partial<mongoose.ConnectOptions> = {};
    
    if (!uriHasTlsOptions) {
      // Only set TLS options if not already in connection string
      if (isAtlas) {
        // Atlas-specific: TLS is automatically enabled via mongodb+srv://
        // Only override if explicitly disabled
        if (process.env.MONGODB_TLS === 'false') {
          tlsOptions.tls = false;
        }
        if (process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === 'true') {
          tlsOptions.tlsAllowInvalidCertificates = true;
        }
      } else if (isSelfHosted) {
        // Self-hosted MongoDB: TLS disabled by default unless explicitly enabled
        if (process.env.MONGODB_TLS === 'true') {
          tlsOptions.tls = true;
          if (process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === 'true') {
            tlsOptions.tlsAllowInvalidCertificates = true;
          }
        }
      }
    }
    
    const connectionOptions: mongoose.ConnectOptions = {
      // Note: bufferCommands and bufferMaxEntries are Mongoose-specific options
      // bufferCommands is set globally above, bufferMaxEntries is not supported in ConnectOptions
      
      // Timeout configurations
      serverSelectionTimeoutMS: parseInt(
        process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || (isAtlas ? '30000' : '10000'),
        10
      ), // Atlas: 30s default, Local: 10s default
      socketTimeoutMS: parseInt(
        process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000',
        10
      ), // 45 seconds default
      connectTimeoutMS: parseInt(
        process.env.MONGODB_CONNECT_TIMEOUT_MS || (isAtlas ? '30000' : '10000'),
        10
      ), // Atlas: 30s default, Local: 10s default
      
      // Connection pool settings
      maxPoolSize: parseInt(
        process.env.MONGODB_MAX_POOL_SIZE || (isAtlas ? '50' : '10'),
        10
      ), // Atlas: 50 default (better for cloud), Local: 10 default
      minPoolSize: parseInt(
        process.env.MONGODB_MIN_POOL_SIZE || (isAtlas ? '5' : '2'),
        10
      ), // Atlas: 5 default, Local: 2 default
      
      // Retry settings (critical for Atlas)
      retryWrites: process.env.MONGODB_RETRY_WRITES !== 'false', // Default: true
      retryReads: process.env.MONGODB_RETRY_READS !== 'false', // Default: true
      
      // Heartbeat settings (for connection monitoring)
      heartbeatFrequencyMS: parseInt(
        process.env.MONGODB_HEARTBEAT_FREQUENCY_MS || '10000',
        10
      ), // Default: 10 seconds
      
      // Compression (if supported by server)
      compressors: process.env.MONGODB_COMPRESSORS 
        ? (process.env.MONGODB_COMPRESSORS.split(',') as ('zlib' | 'snappy' | 'zstd')[])
        : ['zlib'], // Default: zlib compression
      
      // TLS/SSL settings (merged from tlsOptions)
      ...tlsOptions,
    };

    logger.info('Connecting to MongoDB with options:', {
      connectionType: isAtlas ? 'MongoDB Atlas' : isSelfHosted ? 'MongoDB (self-hosted)' : 'MongoDB (unknown format)',
      bufferCommands,
      serverSelectionTimeoutMS: connectionOptions.serverSelectionTimeoutMS,
      maxPoolSize: connectionOptions.maxPoolSize,
      minPoolSize: connectionOptions.minPoolSize,
      tls: connectionOptions.tls ?? (isAtlas ? 'auto-enabled' : 'disabled'),
      uriHasTlsOptions,
    });

    await mongoose.connect(config.mongodbUri, connectionOptions);
    logger.info('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Failed to connect to MongoDB:', {
      error: errorMessage,
      stack: errorStack,
      connectionType: isAtlas ? 'Atlas' : isSelfHosted ? 'Self-hosted' : 'Unknown',
      uriPrefix: config.mongodbUri.substring(0, 30) + '...',
      // Don't log full URI for security
    });
    
    // Provide helpful error messages for common issues
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      logger.error('DNS resolution failed. Check:');
      logger.error('  1. MongoDB hostname/IP is correct');
      logger.error('  2. Network connectivity to MongoDB server');
      logger.error('  3. For Atlas: Check cluster is accessible');
      logger.error('  4. For self-hosted: Check firewall rules allow connections');
    } else if (errorMessage.includes('authentication failed') || errorMessage.includes('bad auth')) {
      logger.error('Authentication failed. Check:');
      logger.error('  1. Username and password are correct');
      logger.error('  2. Database user has proper permissions');
      logger.error('  3. For Atlas: Check database user exists and password is correct');
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      logger.error('Connection timeout. Check:');
      logger.error('  1. MongoDB server is running and accessible');
      logger.error('  2. Network connectivity (firewall, VPN, etc.)');
      logger.error('  3. For Atlas: Check IP whitelist includes Vercel IPs (or 0.0.0.0/0)');
      logger.error('  4. Increase timeout values if needed (MONGODB_SERVER_SELECTION_TIMEOUT_MS)');
    } else if (errorMessage.includes('TLS') || errorMessage.includes('SSL')) {
      logger.error('TLS/SSL error. Check:');
      logger.error('  1. For self-hosted: Set MONGODB_TLS=true if using TLS');
      logger.error('  2. For self-hosted: Set MONGODB_TLS_ALLOW_INVALID_CERTS=true if using self-signed certs (dev only)');
      logger.error('  3. For Atlas: TLS is automatically enabled (mongodb+srv://)');
    }
    
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
};

