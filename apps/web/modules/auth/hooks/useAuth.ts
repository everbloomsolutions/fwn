/**
 * useAuth hook
 * Convenience hook for accessing auth store
 */

import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setUser,
    setToken,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setUser,
    setToken,
    setLoading,
    setError,
    clearError,
  };
}

