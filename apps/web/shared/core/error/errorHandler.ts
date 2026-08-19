/**
 * Error handling utilities
 */

import { AxiosError } from 'axios';
import {
  AppError,
  ApiError,
  NetworkError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/shared/types/error';

/**
 * Transform Axios error to AppError
 */
export function transformError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiError>;

    // Network error (no response)
    if (!axiosError.response) {
      return new NetworkError(
        axiosError.message || 'Network error occurred',
        axiosError
      );
    }

    const { status, data } = axiosError.response;

    // Handle API error response
    if (data && typeof data === 'object' && 'message' in data) {
      const apiError = data as ApiError;
      const validationErrors: ValidationError[] | undefined = apiError.errors;

      switch (status) {
        case 401:
          return new UnauthorizedError(apiError.message);
        case 403:
          return new ForbiddenError(apiError.message);
        case 404:
          return new NotFoundError(apiError.message);
        default:
          return new AppError(apiError.message, status, validationErrors);
      }
    }

    // Fallback for non-standard error responses
    return new AppError(
      axiosError.message || `Request failed with status ${status}`,
      status
    );
  }

  // Generic error
  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError('An unknown error occurred');
}

/**
 * Extract validation errors from error
 */
export function getValidationErrors(error: AppError): ValidationError[] {
  return error.errors || [];
}

/**
 * Get error message for display
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

