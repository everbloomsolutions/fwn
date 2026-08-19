import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import * as authService from '@/modules/auth/services/authService';
import { LoginForm } from '@/modules/auth/components/LoginForm';

// Get the mocked router from the global mock in jest.setup.js
const mockRouter = (global as any).mockNextRouter;

const mockUseAuthFn = jest.fn();
jest.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuthFn(),
}));

const mockLoginServiceFn = jest.fn();
jest.mock('@/modules/auth/services/authService', () => {
  return {
    login: (...args: any[]) => mockLoginServiceFn(...args),
  };
});

describe('LoginForm Component', () => {
  const mockSetAuth = jest.fn();
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthFn.mockReturnValue({
      login: mockSetAuth,
      setLoading: mockSetLoading,
      setError: mockSetError,
      clearError: mockClearError,
      error: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: jest.fn(),
    } as any);
    mockLoginServiceFn.mockResolvedValue({
      user: { _id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'token123',
      refreshToken: 'refresh123',
    });
  });

  it('should render login form', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should update form fields on input', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should show validation errors for invalid input', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      // The schema validates email format, so empty email will show "Invalid email" or "Email is required"
      // Password will show "Password is required"
      // Look for error messages in the error spans, not labels
      const emailError = screen.queryByText(/invalid email|email is required/i, { selector: 'span' });
      const passwordError = screen.queryByText(/password is required/i, { selector: 'span' });
      expect(emailError || passwordError).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('should call login service on valid submit', async () => {
    const mockResponse = {
      user: { _id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'token123',
      refreshToken: 'refresh123',
    };
    
    mockLoginServiceFn.mockResolvedValue(mockResponse);
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'password123');
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLoginServiceFn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    }, { timeout: 5000 });
    
    // Wait for setAuth to be called after login service resolves
    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(
        mockResponse.user,
        mockResponse.token,
        mockResponse.refreshToken
      );
    }, { timeout: 5000 });
  });

  it('should display error message on login failure', async () => {
    mockLoginServiceFn.mockRejectedValue(new Error('Invalid credentials'));
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'wrongpassword');
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLoginServiceFn).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('should disable submit button while submitting', async () => {
    // Create a promise that never resolves to simulate loading state
    let resolvePromise: (value: any) => void;
    const neverResolvingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockLoginServiceFn.mockReturnValue(neverResolvingPromise);
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'password123');
    
    await userEvent.click(submitButton);
    
    // Wait for the button to be disabled (loading state)
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    }, { timeout: 3000 });
    
    // Clean up - resolve the promise to avoid hanging
    resolvePromise!({ user: {}, token: '', refreshToken: '' });
  });
});

