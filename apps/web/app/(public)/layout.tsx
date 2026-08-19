import type { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';
import { Navbar, Footer } from '@/shared/ui';
import PublicLoading from './loading';
import { brandConfig } from '@/shared/brand';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || brandConfig.site.url;

export const metadata: Metadata = {
  title: {
    template: `%s | ${brandConfig.name}`,
    default: `${brandConfig.name} - ${brandConfig.tagline}`,
  },
  description: brandConfig.description,
  keywords: ['natural foods', 'organic honey', 'cold-pressed oils', 'whole spices', 'farm fresh grains', 'healthy food', 'natural food products'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: brandConfig.name,
    title: `${brandConfig.name} - ${brandConfig.tagline}`,
    description: brandConfig.description,
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: brandConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${brandConfig.name} - ${brandConfig.tagline}`,
    description: brandConfig.description,
    images: ['/og-image.svg'],
    creator: brandConfig.social.twitter,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={<PublicLoading />}>
        <main id="main-content" className="flex-1">{children}</main>
      </Suspense>
      <Footer />
    </div>
  );
}

