import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { config } from './index';
import { findOrCreateOAuthUser, OAuthProfile } from '../../modules/auth/oauth.service';
import { logger } from '../middleware/logger';

// Debug: Log OAuth config status
logger.debug('OAuth Config Status:', {
  google: {
    hasClientId: !!config.oauth.google.clientId,
    hasClientSecret: !!config.oauth.google.clientSecret,
  },
  facebook: {
    hasClientId: !!config.oauth.facebook.clientId,
    hasClientSecret: !!config.oauth.facebook.clientSecret,
  },
  linkedin: {
    hasClientId: !!config.oauth.linkedin.clientId,
    hasClientSecret: !!config.oauth.linkedin.clientSecret,
  },
});

passport.serializeUser((user: Express.User, done) => {
  done(null, user._id?.toString() ?? user);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const { User } = await import('../../modules/user/user.model');
    const user = await User.findById(id);
    if (!user) {
      return done(new Error('User not found'), null);
    }
    if (!user.isActive) {
      return done(new Error('User account is inactive'), null);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to get OAuth callback URL
const getOAuthCallbackUrl = (provider: string): string => {
  let baseUrl: string;
  
  // Priority 1: Use BACKEND_URL if explicitly set (recommended for production)
  if (config.backendUrl) {
    baseUrl = config.backendUrl;
  } 
  // Priority 2: In production, construct from VERCEL_URL (for preview deployments) or host
  else if (process.env.NODE_ENV === 'production') {
    // VERCEL_URL is set automatically by Vercel (e.g., api.foodworldnaturals.com or preview-xxx.vercel.app)
    const host = process.env.VERCEL_URL || config.host;
    baseUrl = `${config.protocol}://${host}`;
    // Remove port for production (Vercel handles this automatically)
  } 
  // Priority 3: Development - use host and port
  else {
    const port = config.port && config.port !== 80 && config.port !== 443 ? `:${config.port}` : '';
    baseUrl = `${config.protocol}://${config.host}${port}`;
  }
  
  // Ensure no trailing slash
  baseUrl = baseUrl.replace(/\/$/, '');
  
  const callbackUrl = `${baseUrl}/api/v1/auth/oauth/${provider}/callback`;
  
  // Log the callback URL for debugging (only in development or if explicitly enabled)
  if (process.env.NODE_ENV !== 'production' || process.env.LOG_OAUTH_CALLBACK_URLS === 'true') {
    logger.info(`OAuth ${provider} callback URL: ${callbackUrl}`, {
      provider,
      baseUrl,
      backendUrl: config.backendUrl,
      vercelUrl: process.env.VERCEL_URL,
      host: config.host,
      protocol: config.protocol,
    });
  }
  
  return callbackUrl;
};

// Register Google OAuth strategy
if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.google.clientId,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: getOAuthCallbackUrl('google'),
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const oauthProfile: OAuthProfile = {
            id: profile.id,
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
          };
          const { user } = await findOrCreateOAuthUser(oauthProfile, 'google');
          return done(null, user as Express.User);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
  logger.info('✅ Google OAuth strategy registered');
} else {
  logger.info('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

// Register Facebook OAuth strategy
if (config.oauth.facebook.clientId && config.oauth.facebook.clientSecret) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.oauth.facebook.clientId,
        clientSecret: config.oauth.facebook.clientSecret,
        callbackURL: getOAuthCallbackUrl('facebook'),
        profileFields: ['id', 'email', 'name', 'picture.type(large)'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const oauthProfile: OAuthProfile = {
            id: profile.id,
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`,
            picture: profile.photos?.[0]?.value,
          };
          const { user } = await findOrCreateOAuthUser(oauthProfile, 'facebook');
          return done(null, user as Express.User);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
  logger.info('✅ Facebook OAuth strategy registered');
} else {
  logger.info('⚠️  Facebook OAuth not configured (missing FACEBOOK_CLIENT_ID or FACEBOOK_CLIENT_SECRET)');
}

// Register LinkedIn OAuth strategy
if (config.oauth.linkedin.clientId && config.oauth.linkedin.clientSecret) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: config.oauth.linkedin.clientId,
        clientSecret: config.oauth.linkedin.clientSecret,
        callbackURL: getOAuthCallbackUrl('linkedin'),
        scope: ['openid', 'profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const oauthProfile: OAuthProfile = {
            id: profile.id,
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
          };
          const { user } = await findOrCreateOAuthUser(oauthProfile, 'linkedin');
          return done(null, user as Express.User);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
  logger.info('✅ LinkedIn OAuth strategy registered');
} else {
  logger.info('⚠️  LinkedIn OAuth not configured (missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET)');
}

export default passport;

