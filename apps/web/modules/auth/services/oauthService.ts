/**
 * OAuth service
 * Handles OAuth authentication flows
 */

import { getEnv } from '@/shared/types/env';

export type OAuthProvider = 'google' | 'facebook' | 'linkedin';

const { NEXT_PUBLIC_API_URL } = getEnv();

/**
 * Initiate OAuth flow by redirecting to backend
 */
export function initiateOAuth(provider: OAuthProvider): void {
  if (typeof window === 'undefined') return;

  const oauthUrl = `${NEXT_PUBLIC_API_URL}/api/v1/auth/oauth/${provider}`;
  window.location.href = oauthUrl;
}

/**
 * Handle OAuth callback (called from callback page)
 */
export function getOAuthCallbackParams(): {
  token?: string;
  refreshToken?: string;
  user?: string;
  error?: string;
  isNewUser?: string;
} {
  if (typeof window === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || undefined;
  const refreshToken = params.get('refreshToken') || undefined;
  const user = params.get('user') || undefined;
  const error = params.get('error') || undefined;
  const isNewUser = params.get('isNewUser') || undefined;

  return { token, refreshToken, user, error, isNewUser };
}
