/**
 * Auth service
 * Handles authentication API calls
 */

import { apiRequest } from '@/shared/core/http/apiClient';
import { transformError } from '@/shared/core/error/errorHandler';
import { API_ENDPOINTS } from '@/shared/config/api';
import { User } from '../stores/authStore';

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: true;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
    isNewUser?: boolean;
  };
  message?: string;
}

export interface UserResponse {
  success: true;
  data: {
    user: User;
  };
}

/**
 * Register a new user
 */
export async function register(
  data: RegisterData
): Promise<AuthResponse['data']> {
  try {
    const response = await apiRequest<AuthResponse>({
      method: 'POST',
      url: API_ENDPOINTS.auth.register,
      data,
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<AuthResponse['data']> {
  try {
    const response = await apiRequest<AuthResponse>({
      method: 'POST',
      url: API_ENDPOINTS.auth.login,
      data,
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiRequest<UserResponse>({
      method: 'GET',
      url: API_ENDPOINTS.auth.me,
    });

    return response.data.user;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Logout user (client-side only)
 */
export function logout(): void {
  // Logout is handled by the store
  // This function exists for consistency
}

/**
 * Refresh access token
 */
export async function refreshToken(
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> {
  try {
    const response = await apiRequest<{
      success: true;
      data: { token: string; refreshToken: string };
    }>({
      method: 'POST',
      url: API_ENDPOINTS.auth.refresh,
      data: { refreshToken },
    });

    return response.data;
  } catch (error) {
    throw transformError(error);
  }
}


/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<void> {
  try {
    await apiRequest<{ success: true; message: string }>({
      method: 'POST',
      url: API_ENDPOINTS.auth.forgotPassword,
      data: { email },
    });
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    await apiRequest<{ success: true; message: string }>({
      method: 'POST',
      url: API_ENDPOINTS.auth.resetPassword,
      data: { token, newPassword },
    });
  } catch (error) {
    throw transformError(error);
  }
}
