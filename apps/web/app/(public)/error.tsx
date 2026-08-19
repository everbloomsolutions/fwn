'use client';

import { useEffect } from 'react';
import { Button, Heading, Text, Card, CardContent } from '@/shared/ui';
import Link from 'next/link';
import { logger } from '@/shared/utils/logger';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Public route error:', error);
  }, [error]);

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
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-status-error/10 mb-6">
            <AlertCircle className="w-16 h-16 text-status-error" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Heading level="h1" className="mb-4">
            Something went wrong!
          </Heading>
          <Card className="mb-8 border-status-error/20 bg-status-error/5">
            <CardContent>
              <Text size="lg" className="text-status-error font-medium">
                {error.message || 'An unexpected error occurred'}
              </Text>
              {error.digest && (
                <Text size="sm" color="muted" className="mt-2">
                  Error ID: {error.digest}
                </Text>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button onClick={reset} size="lg" className="group">
            <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="group">
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Go home
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

