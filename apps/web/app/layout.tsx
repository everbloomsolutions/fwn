import type { Metadata } from 'next';
import '@/styles/globals.css';
import '@/styles/typography.css';
import { ThemeProvider } from '@/shared/core/theme/ThemeProvider';
import { ToastProvider } from '@/shared/ui/feedback/ToastProvider';
import { ThemeColorMeta } from '@/shared/ui/layout/ThemeColorMeta';
import { SkipToContent } from '@/shared/ui/layout/SkipToContent';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://foodworldnaturals.com';

export const metadata: Metadata = {
  title: {
    template: '%s | Foodworld Naturals',
    default: 'Foodworld Naturals - Natural Foods | Cold-Pressed Oils | Organic Honey | Whole Spices',
  },
  description: 'Foodworld Naturals – Your destination for authentic, natural, and wholesome food products.',
  keywords: ['natural foods', 'organic honey', 'cold-pressed oils', 'whole spices', 'farm fresh grains', 'healthy food', 'natural food products'],
  authors: [{ name: 'Foodworld Naturals' }],
  creator: 'Foodworld Naturals',
  publisher: 'Foodworld Naturals',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Foodworld Naturals',
    title: 'Foodworld Naturals - Natural Foods | Cold-Pressed Oils | Organic Honey | Whole Spices',
    description: 'Foodworld Naturals – Your destination for authentic, natural, and wholesome food products.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Foodworld Naturals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foodworld Naturals - Natural Foods | Cold-Pressed Oils | Organic Honey | Whole Spices',
    description: 'Foodworld Naturals – Your destination for authentic, natural, and wholesome food products.',
    images: ['/og-image.svg'],
    creator: '@foodworldnaturals',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts - Inter and Fira Code */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('color-mode');
                  let theme;
                  if (stored === 'system' || !stored) {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = prefersDark ? 'dark' : 'light';
                  } else {
                    theme = stored;
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  // Fallback to light if localStorage is not available
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <SkipToContent />
        <ThemeProvider defaultTemplate="default">
          <ThemeColorMeta />
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

