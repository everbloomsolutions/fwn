'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { getOnboardingStatus, type OnboardingStatus } from '../services/onboardingService';
import { logger } from '@/shared/utils/logger';

export function useOnboarding() {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      setStatus(null);
      setNeedsOnboarding(false);
      hasFetched.current = false;
      return;
    }

    // Prevent multiple fetches for the same user
    if (hasFetched.current && status) {
      return;
    }

    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        hasFetched.current = true;
        logger.info('[useOnboarding] Fetching onboarding status...');
        const onboardingStatus = await getOnboardingStatus();
        logger.info('[useOnboarding] Onboarding status received:', onboardingStatus);
        setStatus(onboardingStatus);
        setNeedsOnboarding(!onboardingStatus.onboardingCompleted);
      } catch (error) {
        logger.error('[useOnboarding] Failed to fetch onboarding status:', error);
        // Default to needing onboarding if we can't fetch status
        // This is safer - assume onboarding is needed if we can't verify
        setNeedsOnboarding(true);
        setStatus({
          onboardingCompleted: false,
          profileComplete: 0,
        });
        hasFetched.current = false; // Allow retry on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [isAuthenticated, user?._id]); // Only refetch if user ID changes

  // Reset fetch flag when user changes
  useEffect(() => {
    hasFetched.current = false;
  }, [user?._id]);

  return {
    status,
    isLoading,
    needsOnboarding,
    // Only return true if status explicitly says completed
    isCompleted: status?.onboardingCompleted === true,
    profileComplete: status?.profileComplete ?? 0,
  };
}

