import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_ROUTES, ROUTE_PATTERNS } from '@/shared/config/routes';

/**
 * Next.js middleware for route protection
 * Note: Actual authentication check is done client-side by AuthGuard
 * This middleware handles basic route patterns and checks for auth cookie
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow OAuth callback through
  if (pathname.startsWith(AUTH_ROUTES.OAUTH_CALLBACK)) {
    return NextResponse.next();
  }

  const isProtectedRoute = ROUTE_PATTERNS.PROTECTED.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check for auth token cookie (set by tokenService)
    const authToken = request.cookies.get('auth_token');
    
    // If no auth cookie, redirect to login
    // The client-side AuthGuard will handle the actual auth check
    if (!authToken || !authToken.value) {
      const loginUrl = new URL(AUTH_ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|test-api).*)',
  ],
};

