import type { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';
import { brandConfig } from '@/shared/brand';
import AuthLoading from './loading';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || brandConfig.site.url;

export const metadata: Metadata = {
  title: {
    template: `%s | ${brandConfig.name}`,
    default: `Authentication | ${brandConfig.name}`,
  },
  description: `Sign in or create an account to access ${brandConfig.name}.`,
  robots: {
    index: false, // Don't index auth pages
    follow: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${siteUrl}/login`,
    siteName: brandConfig.name,
    title: `Authentication | ${brandConfig.name}`,
    description: `Sign in or create an account to access ${brandConfig.name}.`,
  },
  twitter: {
    card: 'summary',
    title: `Authentication | ${brandConfig.name}`,
    description: `Sign in or create an account to access ${brandConfig.name}.`,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AuthLoading />}>
      {children}
    </Suspense>
  );
}
