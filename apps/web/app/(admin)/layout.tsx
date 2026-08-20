'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Container, Heading } from '@/shared/ui';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <Container maxWidth="xl">
          <div className="flex h-16 items-center justify-between">
            <Heading level="h1" size="compact">
              Admin
            </Heading>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/inventory" className="text-text-muted hover:text-primary">
                Inventory
              </Link>
              <Link href="/admin/products/new" className="text-text-muted hover:text-primary">
                Add Product
              </Link>
              <Link href="/admin/categories" className="text-text-muted hover:text-primary">
                Categories
              </Link>
              <Link href="/admin/orders" className="text-text-muted hover:text-primary">
                Orders
              </Link>
              <Link href="/" className="text-text-muted hover:text-primary">
                Back to site
              </Link>
            </nav>
          </div>
        </Container>
      </header>
      <main className="py-6 sm:py-10">
        <Container maxWidth="xl">{children}</Container>
      </main>
    </div>
  );
}
