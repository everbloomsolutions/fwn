'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { useAuth } from '../hooks/useAuth';
import { login as loginService } from '../services/authService';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';
import { OAuthButtons } from './OAuthButtons';
import { PUBLIC_ROUTES, AUTH_ROUTES } from '@/shared/config/routes';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login: setAuth, setLoading, setError, clearError, error: authError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    setLoading(true);
    try {
      const response = await loginService(data);
      setAuth(response.user, response.token, response.refreshToken);
      router.push(PUBLIC_ROUTES.SERVICES);
    } catch (error) {
      setLoading(false);
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-2 border-border/50 shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <LogIn className="h-6 w-6 text-primary" />
              Sign In
            </CardTitle>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="relative">
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-text">
                  Email
                  <span className="ml-1 text-status-error" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none z-10" />
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-border bg-surface pl-10 pr-3 py-2 text-sm text-text ring-offset-surface placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-status-error flex items-center gap-1.5" role="alert">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="relative">
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-text">
                  Password
                  <span className="ml-1 text-status-error" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none z-10" />
                  <input
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-border bg-surface pl-10 pr-3 py-2 text-sm text-text ring-offset-surface placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-status-error flex items-center gap-1.5" role="alert">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>
              <div className="mt-2 flex items-center justify-end">
                <Link
                  href={AUTH_ROUTES.FORGOT_PASSWORD}
                  className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  Forgot password?
                </Link>
              </div>
            </motion.div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg bg-status-error/10 border border-status-error/20 p-4 text-sm text-status-error flex items-start gap-2"
              >
                <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{authError}</span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Button
                type="submit"
                className="w-full group"
                loading={isSubmitting}
                size="lg"
              >
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>
          </form>

          <OAuthButtons />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface text-text-light">
                or
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push(PUBLIC_ROUTES.HOME)}
            >
              Continue as Guest
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
