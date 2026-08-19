import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

// Get the mocked router from the global mock in jest.setup.js
const mockRouter = (global as any).mockNextRouter;

// Mock dependencies - must be hoisted before imports
const mockUseAuth = jest.fn();
jest.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock LoginForm component - must match the exact import path
jest.mock('@/modules/auth/components/LoginForm', () => {
  const React = require('react');
  return {
    LoginForm: function MockLoginForm() {
      return React.createElement('div', { 'data-testid': 'login-form' }, 'LoginForm');
    },
  };
});

// Import after mocks are set up
import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock router calls
    (mockRouter.push as jest.Mock).mockClear();
  });

  it('should render login page', () => {
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    } as any);

    render(<LoginPage />);

    // Check for elements that are definitely in the LoginPage
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    // The LoginForm should render email/password fields
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should redirect to services when authenticated', async () => {
    // Clear any previous calls
    (mockRouter.push as jest.Mock).mockClear();
    
    // Mock useAuth to return authenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { _id: '1', email: 'test@example.com' },
      isLoading: false,
    } as any);

    render(<LoginPage />);

    // Wait for the useEffect to run and call router.push
    // The useEffect runs after render, so we need to wait
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/services');
    }, { timeout: 5000 });
  });
});

