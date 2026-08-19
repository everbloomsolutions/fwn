/**
 * Brand Configuration
 * Centralized brand identity configuration for Foodworld Naturals
 */

export const brandConfig = {
  name: 'Foodworld Naturals',
  tagline: 'Natural Foods | Cold-Pressed Oils | Organic Honey | Whole Spices | Farm-Fresh Grains',
  description: 'Foodworld Naturals – Your destination for authentic, natural, and wholesome food products sourced responsibly from farms and trusted producers.',
  shortDescription: 'Natural and wholesome food products for a healthier life',

  // Contact Information
  contact: {
    email: 'info@foodworldnaturals.com',
    support: 'info@foodworldnaturals.com',
    website: process.env.NEXT_PUBLIC_SITE_URL || 'https://foodworldnaturals.com',
  },

  // Social Media
  social: {
    twitter: '@foodworldnaturals',
    twitterUrl: 'https://twitter.com/foodworldnaturals',
    github: 'https://github.com/foodworldnaturals',
    linkedin: 'https://linkedin.com/company/foodworldnaturals',
  },

  // Site Configuration
  // Note: NEXT_PUBLIC_SITE_URL should be set in environment variables
  // This default is used as fallback and can be overridden in layout files
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://foodworldnaturals.com',
    name: 'Foodworld Naturals',
  },

  // Legal
  legal: {
    companyName: 'Foodworld Naturals',
    copyright: `© ${new Date().getFullYear()} Foodworld Naturals. All rights reserved.`,
  },
} as const;

export type BrandConfig = typeof brandConfig;

