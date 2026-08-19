import dotenv from 'dotenv';
import path from 'path';
// Note: Logger is imported after config initialization to avoid circular dependency
// Import will be done conditionally after logger is available

// Use process.cwd() for consistent path resolution
const cwd = process.cwd();
const nodeEnv = process.env.NODE_ENV || 'development';

// Determine root directory (one level up from server)
const rootDir = path.resolve(cwd, '..');

// Environment-specific root env files (loaded by dotenv-cli, but we check for fallback)
const rootEnvDevPath = path.resolve(rootDir, '.env.development');
const rootEnvProdPath = path.resolve(rootDir, '.env.production');
const rootEnvPath = path.resolve(rootDir, '.env');
const serverEnvPath = path.resolve(cwd, '.env');

// Load root environment-specific file first (if exists and matches NODE_ENV)
let rootLoaded = false;
if (nodeEnv === 'production') {
  const prodResult = dotenv.config({ path: rootEnvProdPath });
  if (!prodResult.error && prodResult.parsed) {
    rootLoaded = true;
    console.log('✅ Loaded root .env.production from:', rootEnvProdPath);
  }
} else {
  const devResult = dotenv.config({ path: rootEnvDevPath });
  if (!devResult.error && devResult.parsed) {
    rootLoaded = true;
    console.log('✅ Loaded root .env.development from:', rootEnvDevPath);
  }
}

// Load root .env (overrides environment-specific, if exists)
const rootResult = dotenv.config({ path: rootEnvPath });
if (!rootResult.error && rootResult.parsed) {
  rootLoaded = true;
  console.log('✅ Loaded root .env from:', rootEnvPath);
}

// Load server .env (final override, highest priority)
const serverResult = dotenv.config({ path: serverEnvPath });
if (!serverResult.error && serverResult.parsed) {
  console.log('✅ Loaded server .env from:', serverEnvPath);
}

// Load root .env.local (higher priority than .env)
const rootEnvLocalPath = path.resolve(rootDir, '.env.local');
const rootEnvLocalResult = dotenv.config({ path: rootEnvLocalPath });
if (!rootEnvLocalResult.error && rootEnvLocalResult.parsed) {
  console.log('✅ Loaded root .env.local from:', rootEnvLocalPath);
}

// Load server .env.local (highest priority, final override)
const serverEnvLocalPath = path.resolve(cwd, '.env.local');
const serverEnvLocalResult = dotenv.config({ path: serverEnvLocalPath });
if (!serverEnvLocalResult.error && serverEnvLocalResult.parsed) {
  console.log('✅ Loaded server .env.local from:', serverEnvLocalPath);
}

if (!rootLoaded) {
  console.log('⚠️  Could not load root .env file. Tried:', rootEnvDevPath, rootEnvProdPath, rootEnvPath);
  console.log('⚠️  Using dotenv-cli to load env files is recommended.');
}

interface Config {
  nodeEnv: string;
  port: number;
  host: string;
  protocol: string;
  corsOrigin?: string;
  logLevel: string;
  mongodbUri: string;
  redisUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  oauth: {
    google: {
      clientId?: string;
      clientSecret?: string;
    };
    facebook: {
      clientId?: string;
      clientSecret?: string;
    };
    linkedin: {
      clientId?: string;
      clientSecret?: string;
    };
  };
  firebase?: {
    projectId?: string;
    privateKey?: string;
    clientEmail?: string;
  };
  cloudinary?: {
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
  };
  googleMaps?: {
    apiKey?: string;
  };
  frontendUrl: string;
  backendUrl?: string;
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(
    process.env.BACKEND_PORT || process.env.PORT || '8080',
    10
  ),
  host: process.env.BACKEND_HOST || process.env.HOST || 'localhost',
  protocol: process.env.BACKEND_PROTOCOL || (process.env.NODE_ENV === 'production' ? 'https' : 'http'),
  corsOrigin:
    process.env.BACKEND_CORS_ORIGIN || process.env.CORS_ORIGIN,
  logLevel: process.env.LOG_LEVEL || 'info',
  mongodbUri: process.env.MONGODB_URI || '',
  redisUrl:
    process.env.REDIS_URL ||
    (process.env.NODE_ENV === 'production'
      ? (() => {
          // Redis is optional - if not provided in production, return empty string
          // The Redis client should handle this gracefully
          console.warn('⚠️  REDIS_URL not set in production. Redis features will be disabled.');
          return '';
        })()
      : 'redis://localhost:6379'),
  jwtSecret:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'dev-secret-key-change-in-production'),
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'dev-refresh-secret-key-change-in-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  oauth: {
    google: {
      clientId: process.env.OAUTH_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      clientId: process.env.OAUTH_FACEBOOK_CLIENT_ID || process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_CLIENT_SECRET,
    },
    linkedin: {
      clientId: process.env.OAUTH_LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.OAUTH_LINKEDIN_CLIENT_SECRET || process.env.LINKEDIN_CLIENT_SECRET,
    },
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
  frontendUrl:
    process.env.FRONTEND_URL ||
    (process.env.NODE_ENV === 'production'
      ? (() => {
          throw new Error('FRONTEND_URL is required in production. Set it in your environment variables.');
        })()
      : 'http://localhost:5000'),
  backendUrl:
    process.env.BACKEND_URL ||
    process.env.API_URL ||
    (process.env.NODE_ENV === 'production'
      ? undefined // In production, if not set, will construct from protocol://host:port
      : `http://${process.env.BACKEND_HOST || process.env.HOST || 'localhost'}:${process.env.BACKEND_PORT || process.env.PORT || '8080'}`),
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';

