/**
 * Axios interceptors for request/response handling
 */

import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken } from '@/modules/auth/services/tokenService';
import { getGuestId } from '@/modules/shop/services/guestService';

/**
 * Setup request interceptor to add auth token and guest ID
 */
export function setupRequestInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const guestId = getGuestId();
      if (guestId && config.headers) {
        config.headers['X-Guest-ID'] = guestId;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

/**
 * Setup response interceptor to handle errors
 */
export function setupResponseInterceptor(
  instance: AxiosInstance,
  onUnauthorized?: () => void
): void {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status } = error.response;

        // Handle 401 - Unauthorized
        if (status === 401) {
          removeToken();
          if (onUnauthorized) {
            onUnauthorized();
          }
        }
      }

      return Promise.reject(error);
    }
  );
}

