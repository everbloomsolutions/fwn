import Link from 'next/link';
import { Container, Heading, Text, BackToTop } from '@/shared/ui';
import { API_ENDPOINTS } from '@/shared/config/api';
import { getEnv } from '@/shared/types/env';
import { ArrowRight } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${getEnv().NEXT_PUBLIC_API_URL}${API_ENDPOINTS.categories.LIST}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <Container maxWidth="xl" className="py-6 sm:py-12 lg:py-16">
      <div className="text-center mb-6 sm:mb-8">
        <Heading level="h1" balance className="mb-3">
          Shop by Category
        </Heading>
        <Text className="mx-auto max-w-2xl text-text-muted">
          Explore our natural products by category to find exactly what you need.
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/shop?category=${category.slug}`}
            className="group flex items-center justify-between rounded-2xl border border-border bg-surface p-5 transition hover:shadow-lg hover:-translate-y-1"
          >
            <div>
              <Heading level="h3" className="text-lg" balance>
                {category.name}
              </Heading>
              {category.description && (
                <Text className="mt-1 text-sm text-text-muted" lineClamp={2}>
                  {category.description}
                </Text>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-text-muted transition group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <BackToTop />
    </Container>
  );
}
