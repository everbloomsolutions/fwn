'use client';

import { Navbar, Footer } from '@/shared/ui/layout';
import { Container } from '@/shared/ui';
import { Loader2 } from 'lucide-react';

export function AdminShellSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main id="main-content" className="flex-1 py-6 sm:py-10">
        <Container maxWidth="xl">
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-surface" />
            <div className="h-64 animate-pulse rounded-2xl bg-surface" />
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export function AdminGuardSpinner() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
