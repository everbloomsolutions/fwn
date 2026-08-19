'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { ProductCard } from '@/modules/shop/components/ProductCard';
import { Container, Heading, Text, BackToTop } from '@/shared/ui';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';

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
  unit: string;
  stock: number;
  images: string[];
  isBestSeller: boolean;
  rating?: number;
  reviewCount?: number;
  category: { name: string };
  variants: ProductVariant[];
  updatedAt?: string;
}

interface ProductResponse {
  success: boolean;
  data: Product[];
}

type SortOption = 'newest' | 'popular' | 'best_selling' | 'price_asc' | 'price_desc';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [bestSellerOnly, setBestSellerOnly] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await apiRequest<ProductResponse>({
          method: 'GET',
          url: API_ENDPOINTS.products.LIST,
        });
        setProducts(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q));
    }

    if (selectedUnit) {
      list = list.filter((p) => p.variants.some((v) => v.unit === selectedUnit && v.isActive !== false));
    }

    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    if (bestSellerOnly) {
      list = list.filter((p) => p.isBestSeller);
    }

    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'best_selling':
        list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime());
    }

    return list;
  }, [products, search, selectedUnit, sortBy, inStockOnly, bestSellerOnly]);

  return (
    <Container maxWidth="xl" className="py-8 sm:py-12 lg:py-16">
      <div className="text-center mb-8">
        <Heading level="h1" className="mb-4">
          Shop Natural Foods
        </Heading>
        <Text className="mx-auto max-w-2xl text-text-muted">
          Browse our collection of natural, wholesome food products sourced responsibly for you.
        </Text>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search products or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg py-2.5 pl-9 pr-4 text-sm text-text outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
          >
            <option value="">All packs</option>
            <option value="500g">500g</option>
            <option value="1kg">1kg</option>
            <option value="2kg">2kg</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="best_selling">Best Selling</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            In Stock
          </label>

          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={bestSellerOnly}
              onChange={(e) => setBestSellerOnly(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Best Sellers
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <Text className="text-error">{error}</Text>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center">
          <Text className="text-text-muted">No products found. Try a different search or filter.</Text>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <BackToTop />
    </Container>
  );
}
