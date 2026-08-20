'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { ProductCard } from '@/modules/shop/components/ProductCard';
import { Container, Heading, Text, BackToTop } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { Search, SlidersHorizontal, Loader2, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  category: { _id: string; name: string; slug: string };
  variants: ProductVariant[];
  updatedAt?: string;
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

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategoryResponse {
  success: boolean;
  data: Category[];
}

type SortOption = 'newest' | 'popular' | 'best_selling' | 'price_asc' | 'price_desc';

const LIMIT = 12;

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get('category') || '';
  const initialBestSeller = searchParams.get('isBestSeller') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedPacks, setSelectedPacks] = useState<string[]>(searchParams.get('unit')?.split(',').filter(Boolean) || []);
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [bestSellerOnly, setBestSellerOnly] = useState(initialBestSeller);
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get('page') || 1)));
  const [pagination, setPagination] = useState<ProductResponse['pagination']>({ total: 0, page: 1, limit: LIMIT, totalPages: 1 });

  useEffect(() => {
    apiRequest<CategoryResponse>({
      method: 'GET',
      url: API_ENDPOINTS.categories.LIST,
    })
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const packOptions = useMemo(() => {
    const units = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => {
      if (v.isActive !== false && v.stock > 0) units.add(v.unit);
    }));
    return Array.from(units).sort();
  }, [products]);

  const buildUrl = () => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (search.trim()) params.set('search', search.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (inStockOnly) params.set('inStock', 'true');
    if (bestSellerOnly) params.set('isBestSeller', 'true');
    if (selectedPacks.length) params.set('unit', selectedPacks.join(','));
    return `/shop?${params.toString()}`;
  };

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', LIMIT.toString());
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      if (sortBy !== 'newest') params.set('sort', sortBy);
      if (inStockOnly) params.set('inStock', 'true');
      if (bestSellerOnly) params.set('isBestSeller', 'true');
      if (selectedPacks.length) params.set('unit', selectedPacks.join(','));
      const [productsRes] = await Promise.all([
        apiRequest<ProductResponse>({
          method: 'GET',
          url: `${API_ENDPOINTS.products.LIST}?${params.toString()}`,
        }),
      ]);
      setProducts(productsRes.data);
      setPagination(productsRes.pagination || { total: 0, page: 1, limit: LIMIT, totalPages: 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, sortBy, inStockOnly, bestSellerOnly, selectedPacks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    router.replace(buildUrl(), { scroll: false });
  }, [page, search, selectedCategory, sortBy, inStockOnly, bestSellerOnly, selectedPacks]);

  const activeCategory = categories.find((c) => c.slug === selectedCategory);

  const togglePack = (pack: string) => {
    setSelectedPacks((prev) => (prev.includes(pack) ? prev.filter((p) => p !== pack) : [...prev, pack]));
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedPacks([]);
    setSortBy('newest');
    setInStockOnly(false);
    setBestSellerOnly(false);
    setPage(1);
    router.replace('/shop');
  };

  return (
    <Container maxWidth="xl" className="py-6 sm:py-12 lg:py-16">
      <div className="text-center mb-6 sm:mb-8">
        <Heading level="h1" balance className="mb-3">
          {bestSellerOnly
            ? 'Best Sellers'
            : activeCategory
            ? activeCategory.name
            : 'Shop Natural Foods'}
        </Heading>
        <Text className="mx-auto max-w-2xl text-text-muted">
          {bestSellerOnly
            ? 'Our most-loved natural products, handpicked by customers like you.'
            : activeCategory
            ? `Explore natural products in ${activeCategory.name}`
            : 'Browse our collection of natural, wholesome food products sourced responsibly for you.'}
        </Text>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-3 sm:p-4">
        <div className="relative mb-3 sm:mb-0 sm:flex sm:items-center sm:gap-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted sm:top-5" />
          <input
            type="text"
            placeholder="Search products or categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-bg py-2.5 pl-9 pr-4 text-sm text-text outline-none focus:border-primary"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0 sm:flex-nowrap">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-lg border border-border bg-bg py-2.5 pl-3 pr-8 text-sm text-text"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setPage(1);
                }}
                className="appearance-none rounded-lg border border-border bg-bg py-2.5 pl-3 pr-8 text-sm text-text"
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="best_selling">Best Selling</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            <label className="flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 accent-primary"
              />
              In Stock
            </label>

            <label className="flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text">
              <input
                type="checkbox"
                checked={bestSellerOnly}
                onChange={(e) => {
                  setBestSellerOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 accent-primary"
              />
              Best Sellers
            </label>

            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text hover:bg-surface-hover"
            >
              <X className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>

        {packOptions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Pack size:</span>
            </div>
            {packOptions.map((pack) => {
              const active = selectedPacks.includes(pack);
              return (
                <button
                  key={pack}
                  onClick={() => togglePack(pack)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition',
                    active ? 'border-primary bg-primary text-white' : 'border-border bg-bg text-text hover:border-primary'
                  )}
                >
                  {pack}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <Text className="text-error">{error}</Text>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <Text className="text-text-muted">No products found. Try a different search or filter.</Text>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <Text className="text-sm text-text-muted">
                {pagination.total} products - page {pagination.page} of {pagination.totalPages}
              </Text>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-hover disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-text-muted">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="inline-flex items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-hover disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <BackToTop />
    </Container>
  );
}
