'use client';

import { Heading, Text, Card, CardContent, CardHeader, CardTitle, CTASection, BackToTop } from '@/shared/ui';
import { Leaf, Heart, ShieldCheck, Users, Sprout, Award } from 'lucide-react';
import { brandConfig } from '@/shared/brand';
import { motion } from 'framer-motion';
import { PUBLIC_ROUTES } from '@/shared/config/routes';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex flex-col">
      <section className="relative py-8 md:py-12 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Heading level="h1" className="mb-6">
              About {brandConfig.name}
            </Heading>
            <Text className="mx-auto max-w-3xl text-lg text-text-muted">
              {brandConfig.name} is a natural food products store that connects you with honest farmers, traditional producers, and wholesome ingredients.
            </Text>
          </motion.div>
        </div>
      </section>

      <section className="relative py-8 sm:py-12 lg:py-16 bg-bg-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card enableHover className="h-full border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sprout className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Our Mission</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Text className="text-text-muted">
                    To make <span className="font-semibold text-text">natural, wholesome</span> food accessible to every family while supporting sustainable farming and ethical sourcing.
                  </Text>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card enableHover className="h-full border-l-4 border-l-accent hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Leaf className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Our Vision</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Text className="text-text-muted">
                    To be the most trusted destination for natural food products, where health, taste, and sustainability come together.
                  </Text>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-8 sm:py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Heading level="h2" className="mb-4">
              Our Core Values
            </Heading>
            <Text className="text-text-muted max-w-2xl mx-auto">
              The principles that guide everything we do
            </Text>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {[
              {
                icon: ShieldCheck,
                title: 'Purity',
                description: 'We ensure every product is free from harmful additives and meets high quality standards.',
                color: 'text-status-success',
                bgColor: 'bg-status-success/10',
              },
              {
                icon: Heart,
                title: 'Sustainability',
                description: 'We support farming practices that protect the soil, water, and biodiversity for future generations.',
                color: 'text-primary',
                bgColor: 'bg-primary/10',
              },
              {
                icon: Users,
                title: 'Community',
                description: 'We build lasting relationships with farmers, producers, and customers based on trust and fairness.',
                color: 'text-accent',
                bgColor: 'bg-accent/10',
              },
            ].map((value, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card enableHover className="h-full hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${value.bgColor} ${value.color}`}>
                      <value.icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Text className="text-text-muted leading-relaxed">{value.description}</Text>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="relative py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" aria-labelledby="stats-heading">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center mb-12">
            <Heading level="h2" id="stats-heading" className="mb-4">
              Our Journey
            </Heading>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-4"
          >
            {[
              { label: 'Years of Service', value: '8+' },
              { label: 'Products Offered', value: '150+' },
              { label: 'Partner Farmers', value: '40+' },
              { label: 'Happy Customers', value: '12k+' },
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants} className="text-center">
                <Text className="text-4xl font-bold text-primary mb-2">{stat.value}</Text>
                <Text className="text-text-muted font-medium">{stat.label}</Text>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="relative py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden relative bg-gradient-to-br from-surface via-surface to-surface-hover">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <Award className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-3xl">Our Story</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <Text className="text-text-muted">
                  {brandConfig.name} began with a simple belief: food should be nourishing, honest, and close to its source. We started by visiting local farms and traditional producers, learning their stories, and understanding what makes each ingredient special.
                </Text>
                <Text className="text-text-muted">
                  Today, we curate a wide range of natural foods — from cold-pressed oils and organic honey to whole spices and farm-fresh grains. Every product is chosen with care, so you can bring home food that is good for your family and the planet.
                </Text>
                <Text className="text-text-muted">
                  Whether you are looking for everyday staples or something special, {brandConfig.name} is here to make natural, wholesome eating easy and delightful.
                </Text>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <CTASection
        title="Start Your Natural Journey"
        description={`Shop with ${brandConfig.name} today and experience the goodness of natural foods.`}
        primaryAction={{
          label: 'Shop Now',
          href: PUBLIC_ROUTES.SERVICES,
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
