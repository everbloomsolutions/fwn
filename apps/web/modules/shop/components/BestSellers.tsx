import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { Heading } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { API_ENDPOINTS } from '@/shared/config/api';
import { getEnv } from '@/shared/types/env';

interface ProductVariant {
  _id: string;
  unit: string;
  price: number;
  stock: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  variants: ProductVariant[];
}

interface BestSellersProps {
  limit?: number;
}

async function getBestSellers(limit: number): Promise<Product[]> {
  const res = await fetch(
    `${getEnv().NEXT_PUBLIC_API_URL}${API_ENDPOINTS.products.LIST}?isBestSeller=true&sort=best_selling&limit=${limit}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data || [];
}

export async function BestSellers({ limit = 10 }: BestSellersProps) {
  const products = await getBestSellers(limit);

  if (products.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <div className="mb-6 flex items-end justify-between">
        <Heading level="h2" size="compact" balance>
          Top 10 Best Sellers
        </Heading>
        <Link
          href="/shop?isBestSeller=true"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, idx) => (
          <div key={product._id} className="relative">
            <span
              className={cn(
                'absolute left-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                idx < 3 ? 'bg-amber-400 text-black' : 'bg-surface text-text'
              )}
            >
              {idx + 1}
            </span>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
