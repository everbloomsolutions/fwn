import type { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';
import { AuthGuard } from '@/modules/auth/components/AuthGuard';
import { Navbar, Footer } from '@/shared/ui/layout';
import { brandConfig } from '@/shared/brand';
import AppLoading from './loading';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || brandConfig.site.url;

export const metadata: Metadata = {
  title: {
    template: `%s | ${brandConfig.name}`,
    default: `${brandConfig.name}`,
  },
  description: `Your ${brandConfig.name} account - Manage your profile and settings.`,
  robots: {
    index: false, // Don't index authenticated pages
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${siteUrl}/services`,
    siteName: brandConfig.name,
    title: `${brandConfig.name}`,
    description: `Your ${brandConfig.name} account - Manage your profile and settings.`,
  },
  twitter: {
    card: 'summary',
    title: `${brandConfig.name}`,
    description: `Your ${brandConfig.name} account - Manage your profile and settings.`,
  },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <Suspense fallback={<AppLoading />}>
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </Suspense>
        <Footer />
      </div>
    </AuthGuard>
  );
}
