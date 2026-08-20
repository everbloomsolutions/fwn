'use client';

import { FeatureSection, CTASection, Container, Heading, Text, Card, CardContent, CardHeader, CardTitle, BackToTop } from '@/shared/ui';
import Image from 'next/image';
import { Leaf, Droplets, Sun, Wind, ShoppingBasket, Award, Truck } from 'lucide-react';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { brandConfig } from '@/shared/brand';
import { motion } from 'framer-motion';

const categories = [
  {
    icon: <Droplets className="h-6 w-6 text-white" />,
    title: 'Cold-Pressed Oils',
    description:
      'Pure, wood-pressed and cold-pressed oils including groundnut, sesame, mustard, and coconut — extracted without heat or chemicals.',
    image: 'https://images.unsplash.com/photo-1474979266404-7caddbed54e6?w=800&h=600&fit=crop',
  },
  {
    icon: <Sun className="h-6 w-6 text-white" />,
    title: 'Organic Honey',
    description:
      'Raw, unprocessed honey collected from trusted apiaries and forest sources across India.',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e112d90?w=800&h=600&fit=crop',
  },
  {
    icon: <Wind className="h-6 w-6 text-white" />,
    title: 'Whole Spices',
    description:
      'Aromatic, sun-dried whole spices and spice blends that bring authentic Indian flavors to your kitchen.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=600&fit=crop',
  },
  {
    icon: <ShoppingBasket className="h-6 w-6 text-white" />,
    title: 'Farm-Fresh Grains & Pulses',
    description:
      'Naturally grown rice, millets, pulses, and lentils sourced directly from farmer cooperatives.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop',
  },
  {
    icon: <Leaf className="h-6 w-6 text-white" />,
    title: 'Natural Sweeteners',
    description:
      'Jaggery, palm sugar, and other unrefined sweeteners made using traditional methods.',
    image: 'https://images.unsplash.com/photo-1622484212850-eb936d1f3644?w=800&h=600&fit=crop',
  },
  {
    icon: <Award className="h-6 w-6 text-white" />,
    title: 'Wellness & Superfoods',
    description:
      'Dry fruits, seeds, herbal powders, and superfoods to support a balanced lifestyle.',
    image: 'https://images.unsplash.com/photo-1511690656952-34342d5c28b5?w=800&h=600&fit=crop',
  },
];

const whyChooseUs = [
  {
    icon: <Award className="h-6 w-6 text-status-success" />,
    title: 'Certified Quality',
    description: 'Every product goes through quality checks and comes from verified sources.',
    iconColor: 'text-status-success',
  },
  {
    icon: <Leaf className="h-6 w-6 text-primary" />,
    title: 'No Additives',
    description: 'We avoid preservatives, artificial colors, and synthetic flavoring.',
    iconColor: 'text-primary',
  },
  {
    icon: <Truck className="h-6 w-6 text-accent" />,
    title: 'Pan-India Delivery',
    description: 'Carefully packed and delivered to your doorstep across India.',
    iconColor: 'text-accent',
  },
  {
    icon: <Sun className="h-6 w-6 text-primary" />,
    title: 'Ethical Sourcing',
    description: 'We partner with farmers and producers who follow fair and sustainable practices.',
    iconColor: 'text-primary',
  },
];

export default function ProductsPage() {
  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <Container maxWidth="xl">
        <div className="text-center mb-16">
          <Heading level="h1" className="mb-4">
            Our Products
          </Heading>
          <Text className="mx-auto max-w-3xl text-lg text-text-muted">
            Explore our range of natural and wholesome food products, sourced responsibly for you and your family.
          </Text>
        </div>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 py-8"
        >
          <div className="text-center mb-12">
            <Heading level="h2" className="mb-4">
              Product Categories
            </Heading>
            <Text className="text-text-muted max-w-2xl mx-auto">
              From cooking essentials to healthy snacks, find everything natural under one roof.
            </Text>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group relative overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    <div className="absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white">
                      {category.icon}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Text className="text-text-muted text-sm">{category.description}</Text>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 py-8 bg-bg-muted rounded-lg"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <FeatureSection
              title={`Why Choose ${brandConfig.name}?`}
              description="What makes us the trusted choice for natural food products"
              features={whyChooseUs}
              columns={2}
              className="mb-0"
            />
          </div>
        </motion.section>

        <CTASection
          title="Explore the Natural Range"
          description={`Browse ${brandConfig.name} products and bring home the goodness of nature.`}
          primaryAction={{
            label: 'Contact Us',
            href: PUBLIC_ROUTES.CONTACT,
          }}
          secondaryAction={{
            label: 'About Us',
            href: PUBLIC_ROUTES.ABOUT,
          }}
        />
      </Container>
      <BackToTop />
    </div>
  );
}
