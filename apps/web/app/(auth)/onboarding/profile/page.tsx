'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileCompletionForm } from '@/modules/onboarding/components/ProfileCompletionForm';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { getPostLoginRedirect } from '@/modules/auth/utils/getPostLoginRedirect';
import { useOnboarding } from '@/modules/onboarding/hooks/useOnboarding';

export default function OnboardingProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isCompleted, isLoading: onboardingLoading, status } = useOnboarding();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    // Wait for auth to be ready
    if (authLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      hasRedirected.current = true;
      router.push('/login');
      return;
    }

    // Wait for onboarding status to be loaded
    if (onboardingLoading) return;

    // Only redirect if onboarding is explicitly completed
    // Check both the status and user object to be safe
    const userOnboardingCompleted = user?.onboardingCompleted ?? false;
    const statusOnboardingCompleted = status?.onboardingCompleted ?? false;
    
    // Only redirect if BOTH indicate completion (defensive check)
    if (statusOnboardingCompleted && userOnboardingCompleted && status) {
      hasRedirected.current = true;
      router.push(getPostLoginRedirect(user));
    }
  }, [isAuthenticated, authLoading, isCompleted, onboardingLoading, status, user, router]);

  // Show loading state while checking
  if (authLoading || onboardingLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Only hide if onboarding is explicitly completed with status confirmation
  const userOnboardingCompleted = user?.onboardingCompleted ?? false;
  const statusOnboardingCompleted = status?.onboardingCompleted ?? false;
  
  if (statusOnboardingCompleted && userOnboardingCompleted && status) {
    return null;
  }

  // Show profile form for users with incomplete onboarding
  return <ProfileCompletionForm />;
}

