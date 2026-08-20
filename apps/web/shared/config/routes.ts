/**
 * Application route paths
 * Centralized route definitions for consistency
 * Use these constants instead of hardcoded strings throughout the application
 */

// Admin routes (authenticated admin)
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/inventory',
  INVENTORY: '/admin/inventory',
  PRODUCTS: '/admin/products',
  ORDERS: '/admin/orders',
  CATEGORIES: '/admin/categories',
} as const;

// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  SHOP: '/shop',
  PRODUCT: (slug: string) => `/shop/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  CONTACT: '/contact',
} as const;

// Auth routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  OAUTH_CALLBACK: '/oauth/callback',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

// Onboarding routes
export const ONBOARDING_ROUTES = {
  WELCOME: '/onboarding/welcome',
  PROFILE: '/onboarding/profile',
} as const;

// User routes (authenticated)
export const USER_ROUTES = {
  PROFILE: '/profile',
  SETTINGS: '/settings',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
} as const;

// Route groups (Next.js route group syntax)
export const ROUTE_GROUPS = {
  PUBLIC: '(public)',
  AUTH: '(auth)',
  USER: '(user)',
  DEV: '(dev)',
} as const;

// Route patterns for utilities (arrays for pattern matching)
export const ROUTE_PATTERNS = {
  USER_AREA: ['/profile', '/settings'],
  AUTH_PAGES: ['/login', '/register'],
  PROTECTED: ['/profile', '/settings'],
} as const;

// Type exports for route constants
export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
export type UserRoute = typeof USER_ROUTES[keyof typeof USER_ROUTES];
export type RouteGroup = typeof ROUTE_GROUPS[keyof typeof ROUTE_GROUPS];
