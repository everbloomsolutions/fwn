/**
 * OAuth controller
 * Handles OAuth authentication requests
 */

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { generateOAuthTokens } from './oauth.service';
import { config } from '../../core/config';
import { AppError } from '../../core/exceptions/errorHandler';
import { IUser } from '../user/user.model';

export type OAuthProvider = 'google' | 'facebook' | 'linkedin';

/**
 * Check if OAuth provider is configured
 */
const isProviderConfigured = (provider: OAuthProvider): boolean => {
  switch (provider) {
    case 'google':
      return !!(config.oauth.google.clientId && config.oauth.google.clientSecret);
    case 'facebook':
      return !!(config.oauth.facebook.clientId && config.oauth.facebook.clientSecret);
    case 'linkedin':
      return !!(config.oauth.linkedin.clientId && config.oauth.linkedin.clientSecret);
    default:
      return false;
  }
};

/**
 * Initiate OAuth flow
 */
export const initiateOAuth = (
  provider: OAuthProvider
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isProviderConfigured(provider)) {
      return next(
        new AppError(
          `${provider} OAuth is not configured. Please set ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET in your .env file.`,
          501
        )
      );
    }

    return passport.authenticate(provider, {
      session: false,
      scope: provider === 'google' ? ['profile', 'email'] : undefined,
    })(req, res, next);
  };
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = (
  provider: OAuthProvider
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!isProviderConfigured(provider)) {
      return res.redirect(
        `${config.frontendUrl}/login?error=${encodeURIComponent(
          `${provider} OAuth is not configured`
        )}`
      );
    }

    passport.authenticate(
      provider,
      { session: false },
      async (err: Error | null, user: IUser | null) => {
        if (err) {
          return res.redirect(
            `${config.frontendUrl}/login?error=${encodeURIComponent(err.message)}`
          );
        }

        if (!user) {
          return res.redirect(
            `${config.frontendUrl}/login?error=${encodeURIComponent('OAuth authentication failed')}`
          );
        }

        try {
          const { token, refreshToken } = await generateOAuthTokens(user);

          const { password, ...userWithoutPassword } = user.toObject();
          void password; // Explicitly ignore password

          // Ensure onboardingCompleted is included in the response
          if (!('onboardingCompleted' in userWithoutPassword)) {
            userWithoutPassword.onboardingCompleted = user.onboardingCompleted ?? false;
          }

          // Check if user is new (created within last 5 minutes and onboarding not completed)
          const isNewUser = !user.onboardingCompleted && 
            user.createdAt && 
            (Date.now() - new Date(user.createdAt).getTime()) < 5 * 60 * 1000;

          const redirectUrl = new URL(`${config.frontendUrl}/oauth/callback`);
          redirectUrl.searchParams.set('token', token);
          if (refreshToken) {
            redirectUrl.searchParams.set('refreshToken', refreshToken);
          }
          redirectUrl.searchParams.set(
            'user',
            encodeURIComponent(JSON.stringify(userWithoutPassword))
          );
          redirectUrl.searchParams.set('isNewUser', isNewUser.toString());

          res.redirect(redirectUrl.toString());
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to generate tokens';
          res.redirect(
            `${config.frontendUrl}/login?error=${encodeURIComponent(message)}`
          );
        }
      }
    )(req, res, next);
  };
};

export const oauthController = {
  initiateOAuth,
  handleOAuthCallback,
};

