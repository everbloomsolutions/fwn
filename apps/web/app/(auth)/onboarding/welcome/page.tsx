'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeScreen } from '@/modules/onboarding/components/WelcomeScreen';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { useOnboarding } from '@/modules/onboarding/hooks/useOnboarding';
import { logger } from '@/shared/utils/logger';

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isCompleted, isLoading: onboardingLoading, status } = useOnboarding();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) {
      logger.info('[Onboarding Welcome] Already redirected, skipping');
      return;
    }

    // Wait for auth to be ready
    if (authLoading) {
      logger.info('[Onboarding Welcome] Waiting for auth to load...');
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      logger.info('[Onboarding Welcome] Not authenticated, redirecting to login');
      hasRedirected.current = true;
      router.push('/login');
      return;
    }

    // Wait for onboarding status to be loaded - status must exist
    if (onboardingLoading || !status) {
      logger.info('[Onboarding Welcome] Waiting for onboarding status to load...', { onboardingLoading, hasStatus: !!status });
      return;
    }

    // Only redirect if onboarding is explicitly completed
    // Check both the status and user object to be safe
    const userOnboardingCompleted = user?.onboardingCompleted ?? false;
    const statusOnboardingCompleted = status?.onboardingCompleted === true;
    
    logger.info('[Onboarding Welcome] Status check:', {
      userOnboardingCompleted,
      statusOnboardingCompleted,
      status: status ? { onboardingCompleted: status.onboardingCompleted, profileComplete: status.profileComplete } : null,
      user: user ? { id: user._id, email: user.email, onboardingCompleted: user.onboardingCompleted } : null,
    });
    
    // Only redirect if BOTH indicate completion (defensive check)
    // Must have status object and both must be true
    if (status && statusOnboardingCompleted && userOnboardingCompleted) {
      logger.info('[Onboarding Welcome] Onboarding completed, redirecting to services');
      hasRedirected.current = true;
      router.push(PUBLIC_ROUTES.SERVICES);
    } else {
      logger.info('[Onboarding Welcome] Onboarding not completed, will show welcome screen');
    }
  }, [isAuthenticated, authLoading, isCompleted, onboardingLoading, status, user, router]);

  // Show loading state while checking
  if (authLoading || onboardingLoading || !status) {
    logger.info('[Onboarding Welcome] Rendering loading state', { 
      authLoading, 
      onboardingLoading, 
      hasStatus: !!status,
      status 
    });
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    logger.info('[Onboarding Welcome] Not authenticated, returning null');
    return null;
  }

  // Only hide if onboarding is explicitly completed with status confirmation
  // Must have status object and both must be true
  const userOnboardingCompleted = user?.onboardingCompleted ?? false;
  const statusOnboardingCompleted = status?.onboardingCompleted === true;
  
  logger.info('[Onboarding Welcome] Render check:', {
    userOnboardingCompleted,
    statusOnboardingCompleted,
    status: status ? { onboardingCompleted: status.onboardingCompleted } : null,
    willShowWelcome: !(status && statusOnboardingCompleted && userOnboardingCompleted),
  });
  
  // Only redirect/hide if we have status AND both indicate completion
  if (status && statusOnboardingCompleted && userOnboardingCompleted) {
    logger.info('[Onboarding Welcome] Onboarding completed, returning null (will redirect)');
    return null;
  }

  // Show welcome screen for new users or users with incomplete onboarding
  logger.info('[Onboarding Welcome] Rendering WelcomeScreen - onboarding not completed');
  return <WelcomeScreen />;
}

