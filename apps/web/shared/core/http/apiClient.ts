/**
 * API client with Axios
 * Configured with base URL, interceptors, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getEnv } from '@/shared/types/env';
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors';
import { AUTH_ROUTES } from '@/shared/config/routes';

let apiClientInstance: AxiosInstance | null = null;

/**
 * Create or get API client instance
 */
export function getApiClient(): AxiosInstance {
  if (apiClientInstance) {
    return apiClientInstance;
  }

  const { NEXT_PUBLIC_API_URL } = getEnv();

  apiClientInstance = axios.create({
    baseURL: NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Setup interceptors
  setupRequestInterceptor(apiClientInstance);
  setupResponseInterceptor(apiClientInstance, () => {
    // Handle unauthorized - redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = AUTH_ROUTES.LOGIN;
    }
  });

  return apiClientInstance;
}

/**
 * Make API request with type safety
 */
export async function apiRequest<T = unknown>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const client = getApiClient();
    const response = await client.request<T>(config);
    return response.data;
  } catch (error) {
    // Enhanced error handling for better debugging
    if (axios.isAxiosError(error)) {
      // Network error (backend not reachable)
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error(
          `Cannot connect to API server. Please ensure the backend is running at ${getEnv().NEXT_PUBLIC_API_URL}`
        );
      }
      // Timeout error
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
      // Server error response
      if (error.response) {
        const message = error.response.data?.message || error.message;
        throw new Error(message || 'Server error occurred');
      }
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Reset API client (useful for testing)
 */
export function resetApiClient(): void {
  apiClientInstance = null;
}

