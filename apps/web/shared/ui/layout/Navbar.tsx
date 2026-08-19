/**
 * Navbar Component
 * Navigation bar with context-aware behavior
 * Adapts based on route and authentication status
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useCartStore } from '@/modules/shop/stores/cartStore';
import { MiniCart } from '@/modules/shop/components/MiniCart';
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
import { ShoppingCart } from 'lucide-react';

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.totalItems);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const authPage = isAuthPage(pathname);
  const showNavigationLinks = !authPage;
  const logoHref = PUBLIC_ROUTES.HOME;

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
    <>
      <header className="border-b border-border bg-surface/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <Container maxWidth="xl">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center min-w-0 flex-shrink-0">
              <Logo href={logoHref} size="md" variant="auto" />
            </div>

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
                        isActive ? 'text-primary' : 'text-text-muted hover:text-text'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}

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

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-full p-2 text-text hover:bg-surface-hover"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>

              <div className="md:hidden flex items-center gap-2">
                <ThemeToggle variant="icon" size="sm" />
                <MobileMenu links={navbarNavigationLinks} authLinks={authLinks} />
              </div>
            </div>
          </div>
        </Container>
      </header>
      <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
