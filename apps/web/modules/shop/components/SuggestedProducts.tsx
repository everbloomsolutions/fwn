'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { ProductCard } from './ProductCard';
import { Heading, Text } from '@/shared/ui';
import { Loader2 } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  variants: {
    _id: string;
    unit: string;
    price: number;
    stock: number;
    isActive: boolean;
  }[];
}

interface ProductResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SuggestedProductsProps {
  title?: string;
  categoryId?: string;
  categorySlug?: string;
  excludeIds?: string[];
  limit?: number;
}

export function SuggestedProducts({
  title = 'Suggested products',
  categoryId,
  categorySlug,
  excludeIds = [],
  limit = 4,
}: SuggestedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (categorySlug) {
          params.set('category', categorySlug);
        }
        params.set('sort', 'best_selling');
        params.set('limit', '20');
        const response = await apiRequest<ProductResponse>({
          method: 'GET',
          url: `${API_ENDPOINTS.products.LIST}?${params.toString()}`,
        });
        const list = response.data
          .filter((p) => !excludeIds.includes(p._id) && (!categoryId || p.variants.some((v) => v.stock > 0)))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, limit);
        setProducts(list);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categorySlug, limit, excludeIds]);

  if (products.length === 0 && !loading) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <Heading level="h2" size="compact" balance className="mb-6">
        {title}
      </Heading>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <Text className="text-text-muted">No related products found.</Text>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
