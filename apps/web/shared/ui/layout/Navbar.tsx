/**
 * Navbar Component
 * Navigation bar with context-aware behavior
 * Adapts based on route and authentication status
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/shared/ui';
import { usePathname } from 'next/navigation';
import { MobileMenu } from '@/shared/ui/navigation/MobileMenu';
import { cn } from '@/shared/utils/cn';
import { Container } from './Container';
import { AccountMenu } from './AccountMenu';
import { ThemeToggle } from '@/shared/ui/controls/ThemeToggle';
import { navbarNavigationLinks } from '@/shared/config/navigation';
import { isAuthPage, isActiveRoute } from '@/shared/utils/routeDetection';
import { Logo } from '@/shared/ui/brand';
import { USER_ROUTES, AUTH_ROUTES, PUBLIC_ROUTES } from '@/shared/config/routes';

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Context-aware route detection using shared utility
  const authPage = isAuthPage(pathname);
  
  // Show navigation links for public AND authenticated users (not on auth pages)
  const showNavigationLinks = !authPage;

  // Logo always links to home page
  const logoHref = PUBLIC_ROUTES.HOME;

  // Mobile menu auth links
  const authLinks = isAuthenticated ? (
    <>
      <Link href={USER_ROUTES.PROFILE} className="w-full">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          Profile
        </Button>
      </Link>
      <Link href={USER_ROUTES.SETTINGS} className="w-full">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          Settings
        </Button>
      </Link>
    </>
  ) : (
    <>
      <Link href={AUTH_ROUTES.LOGIN} className="w-full">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          Login
        </Button>
      </Link>
      <Link href={AUTH_ROUTES.REGISTER} className="w-full">
        <Button size="sm" className="w-full justify-start">Sign Up</Button>
      </Link>
    </>
  );

  return (
    <header className="border-b border-border bg-surface/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <Container maxWidth="xl">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <Logo 
              href={logoHref} 
              size="md" 
              variant="auto" 
            />
          </div>

          {/* Navigation Links - Show for both public and authenticated users */}
          {showNavigationLinks && (
            <nav className="hidden md:flex flex-1 items-center justify-center gap-1" aria-label="Main navigation">
              {navbarNavigationLinks.map((link) => {
                const isActive = isActiveRoute(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-base font-medium transition-colors px-4 py-2 rounded-lg',
                      isActive
                        ? 'text-primary'
                        : 'text-text-muted hover:text-text'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right section - Theme toggle and Auth buttons */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 sm:gap-4">
              <ThemeToggle variant="icon" size="sm" />
              {isAuthenticated ? (
                <AccountMenu />
              ) : (
                <>
                  <Link href={AUTH_ROUTES.LOGIN}>
                    <Button variant="ghost" size="sm" className="hover:bg-surface-hover">
                      Login
                    </Button>
                  </Link>
                  <Link href={AUTH_ROUTES.REGISTER}>
                    <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle variant="icon" size="sm" />
              <MobileMenu links={navbarNavigationLinks} authLinks={authLinks} />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
