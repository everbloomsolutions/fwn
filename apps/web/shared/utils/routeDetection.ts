/**
 * Route detection utilities
 * Shared logic for determining route context
 */

import { ROUTE_PATTERNS, USER_ROUTES, AUTH_ROUTES } from '@/shared/config/routes';

/**
 * Check if current pathname is in the authenticated user area
 */
export function isInUserArea(pathname: string | null): boolean {
  if (!pathname) return false;
  return ROUTE_PATTERNS.USER_AREA.some((route) => pathname.startsWith(route));
}

/**
 * Check if current pathname is an authentication page
 */
export function isAuthPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return ROUTE_PATTERNS.AUTH_PAGES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a route matches or is a sub-route of the given href
 */
export function isActiveRoute(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;
  // Handle sub-routes (e.g., /dashboard/settings matches /dashboard)
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true;
  return false;
}

