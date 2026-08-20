/**
 * Navbar Component
 * Navigation bar with context-aware behavior
 * Adapts based on route and authentication status
 */

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
import { API_ENDPOINTS } from '@/shared/config/api';
import { apiRequest } from '@/shared/core/http/apiClient';
import { ShoppingCart, ChevronDown, Grid3X3, Package, ClipboardList, Tags, PlusSquare } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const adminLinks = [
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/products', label: 'Products', icon: PlusSquare },
] as const;

export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';
  const totalItems = useCartStore((state) => state.totalItems);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const authPage = isAuthPage(pathname);
  const showNavigationLinks = !authPage;
  const logoHref = PUBLIC_ROUTES.HOME;

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await apiRequest<{ data: Category[] }>({
          method: 'GET',
          url: API_ENDPOINTS.categories.LIST,
        });
        setCategories(response.data);
      } catch {
        // ignore
      }
    }
    loadCategories();
  }, []);

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

  const mobileCategoryLinks = categories.map((c) => ({
    href: `/shop?category=${c.slug}`,
    label: c.name,
  }));

  const mobileLinks = isAdmin
    ? adminLinks.map((l) => ({ href: l.href, label: l.label }))
    : [...navbarNavigationLinks, ...mobileCategoryLinks];

  const desktopNavLinks = isAdmin ? adminLinks : navbarNavigationLinks;

  return (
    <>
      <header className="border-b border-border bg-surface/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <Container maxWidth="xl">
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center min-w-0 flex-shrink-0">
              <Logo href={logoHref} size="md" variant="auto" />
            </div>

            {showNavigationLinks && (
              <nav className="hidden md:flex flex-1 items-center justify-center gap-1" aria-label="Main navigation">
                {isAdmin
                  ? adminLinks.map((link) => {
                      const isActive =
                        link.href === '/admin/products'
                          ? pathname === link.href
                          : isActiveRoute(pathname, link.href);
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-base font-medium transition',
                            isActive
                              ? 'text-primary'
                              : 'text-text-muted hover:text-text'
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      );
                    })
                  : navbarNavigationLinks.map((link) => {
                      if (link.href === PUBLIC_ROUTES.SHOP) {
                        return (
                          <div
                            key={link.href}
                            className="relative"
                            onMouseEnter={() => {
                              if (timeoutRef.current) clearTimeout(timeoutRef.current);
                              setCategoriesOpen(true);
                            }}
                            onMouseLeave={() => {
                              timeoutRef.current = setTimeout(() => setCategoriesOpen(false), 150);
                            }}
                          >
                            <button
                              onClick={() => setCategoriesOpen((v) => !v)}
                              className={cn(
                                'inline-flex items-center gap-1 rounded-lg px-4 py-2 text-base font-medium transition',
                                isActiveRoute(pathname, link.href)
                                  ? 'text-primary'
                                  : 'text-text-muted hover:text-text'
                              )}
                            >
                              <span>Shop</span>
                              <ChevronDown className={cn('h-4 w-4 transition', categoriesOpen && 'rotate-180')} />
                            </button>
                            {categoriesOpen && (
                              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl">
                                <Link
                                  href="/categories"
                                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text hover:bg-surface-hover"
                                >
                                  <Grid3X3 className="h-4 w-4" /> All Categories
                                </Link>
                                {categories.map((c) => (
                                  <Link
                                    key={c._id}
                                    href={`/shop?category=${c.slug}`}
                                    className="block rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface-hover hover:text-text"
                                  >
                                    {c.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

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

            <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
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
                <MobileMenu links={mobileLinks} authLinks={authLinks} />
              </div>
            </div>
          </div>
        </Container>
      </header>
      <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
