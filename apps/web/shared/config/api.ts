/**
 * API endpoint constants
 */

const API_BASE = '/api/v1';

export const API_ENDPOINTS = {
  // Health
  health: '/health',

  // Auth
  auth: {
    register: `${API_BASE}/auth/register`,
    login: `${API_BASE}/auth/login`,
    logout: `${API_BASE}/auth/logout`,
    me: `${API_BASE}/auth/me`,
    refresh: `${API_BASE}/auth/refresh`,
    forgotPassword: `${API_BASE}/auth/forgot-password`,
    resetPassword: `${API_BASE}/auth/reset-password`,
  },

  // Profile
  profile: {
    update: `${API_BASE}/profile/update`,
    changePassword: `${API_BASE}/profile/change-password`,
  },

  // Onboarding
  onboarding: {
    updateProfile: `${API_BASE}/profile/onboarding/profile`,
    complete: `${API_BASE}/profile/onboarding/complete`,
    status: `${API_BASE}/profile/onboarding/status`,
  },

  // Contact
  contact: `${API_BASE}/contact`,

  // Projects
  projects: {
    CREATE: `${API_BASE}/projects`,
    LIST: `${API_BASE}/projects`,
    DETAIL: (id: string) => `${API_BASE}/projects/${id}`,
    ACCEPT_QUOTE: (id: string) => `${API_BASE}/projects/${id}/accept-quote`,
    REJECT_QUOTE: (id: string) => `${API_BASE}/projects/${id}/reject-quote`,
  },

  // Products
  products: {
    LIST: `${API_BASE}/products`,
    DETAIL: (slug: string) => `${API_BASE}/products/${slug}`,
  },

  // Categories
  categories: {
    LIST: `${API_BASE}/categories`,
    DETAIL: (slug: string) => `${API_BASE}/categories/${slug}`,
  },

  // Cart
  cart: {
    GET: `${API_BASE}/cart`,
    ADD_ITEM: `${API_BASE}/cart/items`,
    UPDATE_ITEM: (variantId: string) => `${API_BASE}/cart/items/${variantId}`,
    REMOVE_ITEM: (variantId: string) => `${API_BASE}/cart/items/${variantId}`,
    CLEAR: `${API_BASE}/cart`,
  },

  // Orders
  orders: {
    CREATE: `${API_BASE}/orders`,
    LIST: `${API_BASE}/orders`,
    DETAIL: (id: string) => `${API_BASE}/orders/${id}`,
    TRACK: `${API_BASE}/orders/track`,
    PAYMENT: `${API_BASE}/orders/payment/confirm`,
  },
} as const;
