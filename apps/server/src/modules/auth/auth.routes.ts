import { Router, type IRouter } from 'express';
import { authController } from './auth.controller';
import { oauthController } from './oauth.controller';
import { validateBody } from '../../core/middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema';
import { authenticate } from '../../core/middleware/auth';
import { authRateLimiter, strictAuthRateLimiter } from '../../core/middleware/rateLimit';
import { config } from '../../core/config';

const router: IRouter = Router();

// Public routes with rate limiting
router.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', strictAuthRateLimiter, validateBody(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);

// Password reset routes
router.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validateBody(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);

// OAuth routes
router.get('/oauth/google', oauthController.initiateOAuth('google'));
router.get('/oauth/google/callback', oauthController.handleOAuthCallback('google'));

router.get('/oauth/facebook', oauthController.initiateOAuth('facebook'));
router.get('/oauth/facebook/callback', oauthController.handleOAuthCallback('facebook'));

router.get('/oauth/linkedin', oauthController.initiateOAuth('linkedin'));
router.get('/oauth/linkedin/callback', oauthController.handleOAuthCallback('linkedin'));

// OAuth callback URLs debug endpoint (useful for troubleshooting)
router.get('/oauth/callback-urls', (_req, res) => {
  // Use the same logic as passport.ts
  const getCallbackUrl = (provider: string): string => {
    let baseUrl: string;
    
    if (config.backendUrl) {
      baseUrl = config.backendUrl;
    } else if (process.env.NODE_ENV === 'production') {
      const host = process.env.VERCEL_URL || config.host;
      baseUrl = `${config.protocol}://${host}`;
    } else {
      const port = config.port && config.port !== 80 && config.port !== 443 ? `:${config.port}` : '';
      baseUrl = `${config.protocol}://${config.host}${port}`;
    }
    
    baseUrl = baseUrl.replace(/\/$/, '');
    return `${baseUrl}/api/v1/auth/oauth/${provider}/callback`;
  };

  res.json({
    success: true,
    message: 'OAuth callback URLs (add these EXACT URLs to your OAuth provider)',
    callbackUrls: {
      google: getCallbackUrl('google'),
      facebook: getCallbackUrl('facebook'),
      linkedin: getCallbackUrl('linkedin'),
    },
    config: {
      backendUrl: config.backendUrl || 'not set (will be constructed)',
      host: config.host,
      protocol: config.protocol,
      port: config.port,
      vercelUrl: process.env.VERCEL_URL || 'not set',
      nodeEnv: config.nodeEnv,
    },
    instructions: {
      google: 'Go to Google Cloud Console → APIs & Services → Credentials → Your OAuth Client ID → Authorized redirect URIs',
      facebook: 'Go to Facebook Developers → Your App → Settings → Basic → Valid OAuth Redirect URIs',
      linkedin: 'Go to LinkedIn Developer Portal → Your App → Auth → Authorized redirect URLs',
    },
    note: 'Copy the callback URLs above EXACTLY (including https://, no trailing slashes)',
  });
});

export default router;
