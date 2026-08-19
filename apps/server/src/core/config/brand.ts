/**
 * Brand Configuration for Backend
 * Used for email templates, API metadata, and other backend Foodworld Naturals needs
 * All values come from environment variables to avoid hardcoding
 */

export const brandConfig = {
  name: process.env.BRAND_NAME || 'Foodworld Naturals',
  tagline: process.env.BRAND_TAGLINE || 'Natural Foods | Cold-Pressed Oils | Organic Honey | Whole Spices | Farm-Fresh Grains',
  description: process.env.BRAND_DESCRIPTION || 'Foodworld Naturals – Your destination for authentic, natural, and wholesome food products.',

  // Brand Colors (for email templates)
  colors: {
    primary: process.env.BRAND_COLOR_PRIMARY || '#3b82f6',
    secondary: process.env.BRAND_COLOR_SECONDARY || '#64748b',
    accent: process.env.BRAND_COLOR_ACCENT || '#8b5cf6',
    success: process.env.BRAND_COLOR_SUCCESS || '#10b981',
    warning: process.env.BRAND_COLOR_WARNING || '#f59e0b',
    error: process.env.BRAND_COLOR_ERROR || '#ef4444',
    info: process.env.BRAND_COLOR_INFO || '#3b82f6',
  },

  // Contact Information (from environment variables)
  contact: {
    email: process.env.BRAND_CONTACT_EMAIL || process.env.ADMIN_EMAIL || 'info@foodworldnaturals.com',
    support: process.env.BRAND_SUPPORT_EMAIL || process.env.ADMIN_EMAIL || 'info@foodworldnaturals.com',
    website: process.env.BRAND_WEBSITE_URL || process.env.FRONTEND_URL || 'https://foodworldnaturals.com',
  },

  // Social Media
  social: {
    twitter: process.env.BRAND_TWITTER_HANDLE || '@foodworldnaturals',
    twitterUrl: process.env.BRAND_TWITTER_URL || 'https://twitter.com/foodworldnaturals',
  },

  // API Metadata
  api: {
    name: process.env.API_NAME || 'Foodworld Naturals API',
    version: process.env.API_VERSION || '1.0.0',
    description: process.env.API_DESCRIPTION || 'Foodworld Naturals API - Natural food products e-commerce backend',
  },
} as const;

export type BrandConfig = typeof brandConfig;

