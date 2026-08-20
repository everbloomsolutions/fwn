/**
 * Onboarding service
 * Handles onboarding API calls
 */

import { apiRequest } from '@/shared/core/http/apiClient';
import { transformError } from '@/shared/core/error/errorHandler';
import { API_ENDPOINTS } from '@/shared/config/api';
import { User } from '@/modules/auth/stores/authStore';

export interface UpdateOnboardingProfileData {
  name?: string;
  phoneNumber?: string;
  company?: string;
  preferences?: Record<string, unknown>;
}

export interface OnboardingStatus {
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  profileComplete: number;
}

export interface OnboardingResponse {
  success: true;
  data: {
    user?: User;
  };
  message?: string;
}

export interface OnboardingStatusResponse {
  success: true;
  data: OnboardingStatus;
}

/**
 * Update onboarding profile
 */
export async function updateOnboardingProfile(
  data: UpdateOnboardingProfileData
): Promise<OnboardingResponse['data']> {
  try {
    const response = await apiRequest<OnboardingResponse>({
      method: 'PATCH',
      url: API_ENDPOINTS.onboarding.updateProfile,
      data,
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(): Promise<void> {
  try {
    await apiRequest<{ success: true; message: string }>({
      method: 'POST',
      url: API_ENDPOINTS.onboarding.complete,
    });
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Get onboarding status
 */
export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  try {
    const response = await apiRequest<OnboardingStatusResponse>({
      method: 'GET',
      url: API_ENDPOINTS.onboarding.status,
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}

