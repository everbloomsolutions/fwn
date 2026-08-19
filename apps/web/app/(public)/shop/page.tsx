'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { ProductCard } from '@/modules/shop/components/ProductCard';
import { Container, Heading, Text, BackToTop } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { Search, SlidersHorizontal, Loader2, ChevronDown, X } from 'lucide-react';

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

const PACK_OPTIONS = ['200g', '500g', '1kg', '200ml', '500ml', '1ltr', '1pcs', '2pcs', '3pcs'];

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialBestSeller = searchParams.get('isBestSeller') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [bestSellerOnly, setBestSellerOnly] = useState(initialBestSeller);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          apiRequest<ProductResponse>({
            method: 'GET',
            url: API_ENDPOINTS.products.LIST,
          }),
          apiRequest<CategoryResponse>({
            method: 'GET',
            url: API_ENDPOINTS.categories.LIST,
          }),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q));
    }

    if (selectedCategory) {
      list = list.filter((p) => p.category.slug === selectedCategory);
    }

    if (selectedPacks.length > 0) {
      list = list.filter((p) => p.variants.some((v) => selectedPacks.includes(v.unit) && v.isActive !== false));
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
  }, [products, search, selectedCategory, selectedPacks, sortBy, inStockOnly, bestSellerOnly]);

  const activeCategory = categories.find((c) => c.slug === selectedCategory);

  const togglePack = (pack: string) => {
    setSelectedPacks((prev) => (prev.includes(pack) ? prev.filter((p) => p !== pack) : [...prev, pack]));
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedPacks([]);
    setSortBy('newest');
    setInStockOnly(false);
    setBestSellerOnly(false);
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
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg py-2.5 pl-9 pr-4 text-sm text-text outline-none focus:border-primary"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0 sm:flex-nowrap">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (e.target.value) {
                    router.replace(`/shop?category=${e.target.value}`);
                  } else {
                    router.replace('/shop');
                  }
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
                onChange={(e) => setSortBy(e.target.value as SortOption)}
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
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              In Stock
            </label>

            <label className="flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text">
              <input
                type="checkbox"
                checked={bestSellerOnly}
                onChange={(e) => setBestSellerOnly(e.target.checked)}
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

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Pack size:</span>
          </div>
          {PACK_OPTIONS.map((pack) => {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      <BackToTop />
    </Container>
  );
}
