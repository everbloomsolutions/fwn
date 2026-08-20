'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Container } from '@/shared/ui';
import { Navbar, Footer } from '@/shared/ui/layout';
import { Loader2 } from 'lucide-react';

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
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main id="main-content" className="flex-1 py-6 sm:py-10">
        <Container maxWidth="xl">{children}</Container>
      </main>
      <Footer />
    </div>
  );
}
