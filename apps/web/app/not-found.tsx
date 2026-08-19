'use client';

import Link from 'next/link';
import { Button, Heading, Text } from '@/shared/ui';
import { motion } from 'framer-motion';
import { FileQuestion, Home, Info, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-surface via-bg-muted to-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl w-full"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-6">
            <FileQuestion className="w-16 h-16 text-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Heading level="h1" className="mb-4 text-8xl md:text-9xl font-bold text-primary">
            404
          </Heading>
          <Heading level="h2" className="mb-4">
            Page Not Found
          </Heading>
          <Text size="lg" color="muted" className="mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <Button size="lg" className="group">
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Go Home
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="group">
              <Info className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Learn More
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => window.history.back()}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Go back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

