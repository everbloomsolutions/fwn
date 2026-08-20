'use client';

import {
  HeroSection,
  FeatureSection,
  CTASection,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  BackToTop,
  StatsSection,
} from '@/shared/ui';
import { Leaf, Heart, ShieldCheck, Sprout } from 'lucide-react';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { brandConfig } from '@/shared/brand';
import { ReactNode } from 'react';

interface HomeClientProps {
  children: ReactNode;
}

export default function HomeClient({ children }: HomeClientProps) {
  const stats = [
    { label: 'Natural Products', value: '150+' },
    { label: 'Trusted Farmers', value: '40+' },
    { label: 'Happy Customers', value: '12k+' },
  ];

  return (
    <div className="flex flex-col">
      <HeroSection
        title={brandConfig.tagline}
        description="Authentic, natural, and wholesome food products sourced responsibly from farms and trusted producers across India."
        primaryAction={{
          label: 'Shop Now',
          href: PUBLIC_ROUTES.SHOP,
        }}
        secondaryAction={{
          label: 'About Us',
          href: PUBLIC_ROUTES.ABOUT,
        }}
        background="image"
        backgroundImages={[
          {
            src: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&h=1080&fit=crop',
            alt: 'Fresh organic vegetables at a farmers market',
          },
          {
            src: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=1920&h=1080&fit=crop',
            alt: 'Assorted whole spices and herbs',
          },
          {
            src: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=1920&h=1080&fit=crop',
            alt: 'Honey jars and natural sweeteners',
          },
          {
            src: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=1920&h=1080&fit=crop',
            alt: 'Cold-pressed oil bottles',
          },
        ]}
        overlay="gradient"
        overlayOpacity={0.6}
        parallax={true}
        autoplay={true}
        autoplayInterval={5000}
        showIndicators={true}
        showNavigation={true}
      />

      <FeatureSection
        title="Why Choose Our Natural Foods"
        description="We bring you carefully curated food products that are good for you and the planet."
        features={[
          {
            icon: Leaf,
            title: '100% Natural',
            description:
              'Our products are free from artificial preservatives, colors, and flavors, keeping your meals pure and healthy.',
            iconColor: 'text-status-success',
          },
          {
            icon: ShieldCheck,
            title: 'Quality Certified',
            description:
              'Every product is sourced from certified farms and producers that follow strict quality and hygiene standards.',
            iconColor: 'text-primary',
          },
          {
            icon: Heart,
            title: 'Farm to Family',
            description:
              'We work directly with farmers to bring fresh, wholesome food from the source to your doorstep.',
            iconColor: 'text-accent',
          },
        ]}
      />

      {/* Stats Section */}
      <StatsSection
        title="Our Growing Community"
        description="Trusted by thousands of families who care about what they eat"
        stats={stats.map((stat) => ({ label: stat.label, value: stat.value }))}
        columns={3}
        animate={true}
      />

      {/* Mission & Vision Section */}
      <section className="relative bg-bg-muted py-4 sm:py-6 lg:py-8" aria-labelledby="mission-vision-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 id="mission-vision-heading" className="mb-4 text-2xl font-bold text-text sm:text-3xl">
              Our Mission &amp; Vision
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <Card
                enableHover
                className="h-full border-l-4 border-l-primary hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sprout className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Mission Statement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-text-muted">
                    To make <span className="font-semibold text-text">natural, wholesome</span> food accessible to every family while supporting sustainable farming and ethical sourcing.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card
                enableHover
                className="h-full border-l-4 border-l-accent hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Leaf className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Vision Statement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-text-muted">
                    To be the most trusted destination for natural food products, where health, taste, and sustainability come together.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </section>

      <CTASection
        title="Ready to Eat Healthier?"
        description={`Explore ${brandConfig.name} today for natural and wholesome food products.`}
        primaryAction={{
          label: 'Shop Now',
          href: PUBLIC_ROUTES.SHOP,
        }}
        secondaryAction={{
          label: 'Contact Us',
          href: PUBLIC_ROUTES.CONTACT,
        }}
      />
      <BackToTop />
    </div>
  );
}
