'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { AUTH_ROUTES, PUBLIC_ROUTES } from '@/shared/config/routes';
import { getPostLoginRedirect } from '@/modules/auth/utils/getPostLoginRedirect';
import { Logo } from '@/shared/ui/brand';
import { motion } from 'framer-motion';
import { brandConfig } from '@/shared/brand';
import { Sparkles, Shield, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push(getPostLoginRedirect(user));
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-bg-muted p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Logo href={PUBLIC_ROUTES.HOME} size="lg" variant="auto" className="mb-8" />
          <h1 className="text-3xl font-bold text-text mb-4">
            Welcome Back
          </h1>
          <p className="text-lg text-text-muted mb-8">
            {brandConfig.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 space-y-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text mb-1">Secure & Reliable</h3>
              <p className="text-sm text-text-muted">Your data is protected with enterprise-grade security</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text mb-1">Fast & Efficient</h3>
              <p className="text-sm text-text-muted">Quick access to all your services and projects</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text mb-1">Professional Tools</h3>
              <p className="text-sm text-text-muted">Manage your electrical projects with ease</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-bg-muted">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <Logo href={PUBLIC_ROUTES.HOME} size="md" variant="auto" className="mb-4 mx-auto" />
          </div>
          <LoginForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link
                href={AUTH_ROUTES.REGISTER}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

