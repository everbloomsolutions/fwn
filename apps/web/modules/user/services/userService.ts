/**
 * User service
 * Handles user profile and settings API calls
 */

import { apiRequest } from '@/shared/core/http/apiClient';
import { transformError } from '@/shared/core/error/errorHandler';
import { API_ENDPOINTS } from '@/shared/config/api';
import { User } from '@/modules/auth/stores/authStore';

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  success: true;
  data: {
    user: User;
  };
  message?: string;
}

export interface ChangePasswordResponse {
  success: true;
  message: string;
}

/**
 * Update user profile
 */
export async function updateProfile(
  data: UpdateProfileData
): Promise<ProfileResponse['data']> {
  try {
    const response = await apiRequest<ProfileResponse>({
      method: 'PUT',
      url: API_ENDPOINTS.profile.update,
      data,
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Change user password
 */
export async function changePassword(
  data: ChangePasswordData
): Promise<void> {
  try {
    await apiRequest<ChangePasswordResponse>({
      method: 'POST',
      url: API_ENDPOINTS.profile.changePassword,
      data: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
    });
  } catch (error) {
    throw transformError(error);
  }
}

