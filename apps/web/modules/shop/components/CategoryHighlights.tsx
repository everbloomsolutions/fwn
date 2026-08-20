import Link from 'next/link';
import Image from 'next/image';
import { Heading, Text } from '@/shared/ui';
import { ArrowRight } from 'lucide-react';
import { API_ENDPOINTS } from '@/shared/config/api';
import { getEnv } from '@/shared/types/env';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

const categoryImages: Record<string, string> = {
  'dals-lentils-pulses': 'https://images.unsplash.com/photo-1610725664285-7c7762a7f656?w=600&h=400&fit=crop',
  'dry-fruits-nuts': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=400&fit=crop',
  'flours-sooji-rava': 'https://images.unsplash.com/photo-1509440159596-0249088775ff?w=600&h=400&fit=crop',
  'oils-ghee': 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=600&h=400&fit=crop',
  'spices-masalas': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&h=400&fit=crop',
  'honey-jaggery': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop',
};

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

export async function CategoryHighlights() {
  const categories = await getCategories();

  if (categories.length === 0) return null;

  return (
    <section className="py-8 sm:py-12">
      <Heading level="h2" size="compact" balance className="mb-6 text-center">
        Shop by Category
      </Heading>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/shop?category=${category.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-lg"
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src={categoryImages[category.slug] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop'}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-white sm:text-xl">{category.name}</h3>
                {category.description && (
                  <Text className="mt-1 text-sm text-white/80" lineClamp={2}>
                    {category.description}
                  </Text>
                )}
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-white">
                  Shop now <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
