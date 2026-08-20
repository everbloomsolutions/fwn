'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getOAuthCallbackParams } from '@/modules/auth/services/oauthService';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { User } from '@/modules/auth/stores/authStore';
import { AUTH_ROUTES } from '@/shared/config/routes';
import { getPostLoginRedirect } from '@/modules/auth/utils/getPostLoginRedirect';
import { logger } from '@/shared/utils/logger';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { login: setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple processing
    if (processedRef.current) return;
    processedRef.current = true;

    const params = getOAuthCallbackParams();

    if (params.error) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setError(params.error || 'OAuth error occurred');
        setTimeout(() => {
          router.replace(AUTH_ROUTES.LOGIN);
        }, 3000);
      }, 0);
      return;
    }

    if (params.token && params.user) {
      try {
        const user: User = JSON.parse(decodeURIComponent(params.user));
        const token = params.token;
        const refreshToken = params.refreshToken;
        const isNewUser = params.isNewUser === 'true';
        
        // Debug logging
        logger.info('OAuth Callback - User data:', {
          email: user.email,
          isNewUser,
          onboardingCompleted: user.onboardingCompleted,
          hasOnboardingField: 'onboardingCompleted' in user,
        });
        
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setAuth(user, token, refreshToken);
          // Wait a bit longer to ensure cookie is set before redirect
          // Use window.location for full page reload to ensure middleware sees the cookie
          setTimeout(() => {
            const redirect = getPostLoginRedirect(user, { isNewUser });
            logger.info(`OAuth Callback - Redirecting to ${redirect}`);
            window.location.href = redirect;
          }, 200);
        }, 0);
      } catch {
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setError('Failed to process OAuth callback');
          setTimeout(() => {
            router.replace(AUTH_ROUTES.LOGIN);
          }, 3000);
        }, 0);
      }
    } else {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setError('OAuth callback missing required parameters');
        setTimeout(() => {
          router.replace(AUTH_ROUTES.LOGIN);
        }, 3000);
      }, 0);
    }
  }, [router, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="mb-4 text-red-600">Error: {error}</div>
            <p className="text-text-muted">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-text-muted">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  );
}
