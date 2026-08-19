'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { ProductCard } from './ProductCard';
import { Heading, Text } from '@/shared/ui';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

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

interface ProductResponse {
  success: boolean;
  data: Product[];
}

interface BestSellersProps {
  limit?: number;
}

export function BestSellers({ limit = 10 }: BestSellersProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await apiRequest<ProductResponse>({
          method: 'GET',
          url: `${API_ENDPOINTS.products.LIST}?isBestSeller=true&sort=best_selling&limit=${limit}`,
        });
        setProducts(response.data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [limit]);

  if (loading) {
    return (
      <section className="mt-12 sm:mt-16">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

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
