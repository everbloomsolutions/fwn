'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui';
import { Logo } from '@/shared/ui/brand';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { AUTH_ROUTES, PUBLIC_ROUTES, USER_ROUTES } from '@/shared/config/routes';

export function AppHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push(AUTH_ROUTES.LOGIN);
  };

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Logo href={PUBLIC_ROUTES.HOME} size="md" variant="auto" />
            <div className="flex space-x-4">
              <Link
                href={PUBLIC_ROUTES.SERVICES}
                className="text-text-muted hover:text-text transition-colors"
              >
                Services
              </Link>
              <Link
                href={USER_ROUTES.PROFILE}
                className="text-text-muted hover:text-text transition-colors"
              >
                Profile
              </Link>
              <Link
                href={USER_ROUTES.SETTINGS}
                className="text-text-muted hover:text-text transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-text-muted">
                {user.name || user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

