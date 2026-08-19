'use client';

import { useEffect } from 'react';
import { Button, Heading, Text } from '@/shared/ui';
import Link from 'next/link';
import { logger } from '@/shared/utils/logger';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Auth route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-muted px-4">
      <div className="w-full max-w-md rounded-lg bg-surface p-8 shadow-sm">
        <div className="text-center">
          <Heading level="h1" className="mb-4">
            Authentication Error
          </Heading>
          <Text size="lg" color="muted" className="mb-8">
            {error.message || 'An error occurred during authentication'}
          </Text>
          <div className="flex flex-col gap-4">
            <Button onClick={reset} className="w-full">Try again</Button>
            <Link href="/login">
              <Button variant="outline" className="w-full">Back to login</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

