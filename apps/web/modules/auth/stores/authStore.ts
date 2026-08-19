/**
 * Auth store using Zustand
 * Manages authentication state and user data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setToken, removeToken } from '../services/tokenService';

export interface User {
  _id: string;
  email: string;
  name?: string;
  role: 'user';
  isActive: boolean;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
  phoneNumber?: string;
  company?: string;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
}

interface AuthActions {
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      login: (user, token, refreshToken) => {
        setToken(token, refreshToken);
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
          isLoading: false,
        });
      },

      logout: () => {
        removeToken();
        set({
          ...initialState,
          _hasHydrated: true,
        });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user, isLoading: false });
      },

      setToken: (token) => {
        setToken(token);
        set({ token });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          state.isLoading = false;
        }
      },
    }
  )
);

