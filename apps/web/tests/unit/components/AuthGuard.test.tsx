import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthGuard } from '@/modules/auth/components/AuthGuard';

// Get the mocked router from the global mock in jest.setup.js
const mockRouter = (global as any).mockNextRouter;

// Create a mutable store state object
const mockStoreState: any = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  error: null,
  _hasHydrated: true,
};

// Mock Zustand store
jest.mock('@/modules/auth/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    if (typeof selector === 'function') {
      return selector(mockStoreState);
    }
    return mockStoreState;
  },
}));

describe('AuthGuard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock store state
    Object.assign(mockStoreState, {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      error: null,
      _hasHydrated: true,
    });
    (mockRouter.push as jest.Mock).mockClear();
  });

  it('should render children when authenticated', async () => {
    mockStoreState.isAuthenticated = true;
    mockStoreState.isLoading = false;

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should redirect when not authenticated', async () => {
    mockStoreState.isAuthenticated = false;
    mockStoreState.isLoading = false;

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show loading state while checking auth', async () => {
    mockStoreState.isAuthenticated = false;
    mockStoreState.isLoading = true;

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    // Wait for component to mount and render loading state
    await waitFor(() => {
      // Should show loading indicator - the component shows "Loading..." text
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    }, { timeout: 5000 });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should use custom redirect path', async () => {
    mockStoreState.isAuthenticated = false;
    mockStoreState.isLoading = false;

    render(
      <AuthGuard redirectTo="/custom-login">
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/custom-login');
    }, { timeout: 3000 });
  });
});
