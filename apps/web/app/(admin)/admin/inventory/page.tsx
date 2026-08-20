'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Heading, Text, Button } from '@/shared/ui';
import { PageHeader } from '@/shared/ui/layout';
import { Loader2, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface Variant {
  _id: string;
  unit: string;
  stock: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  isActive: boolean;
  variants: Variant[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
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

interface CategoryResponse {
  success: boolean;
  data: Category[];
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ProductResponse['pagination']>({ total: 0, page: 1, limit: 20, totalPages: 1 });

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiRequest<CategoryResponse>({ method: 'GET', url: API_ENDPOINTS.categories.LIST });
        setCategories(res.data || []);
      } catch {
        setCategories([]);
      }
    }
    loadCategories();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);
      if (lowStock) params.set('inStock', 'true');
      if (activeFilter !== 'all') params.set('active', activeFilter === 'active' ? 'true' : 'false');
      const res = await apiRequest<ProductResponse>({
        method: 'GET',
        url: `${API_ENDPOINTS.products.LIST}?${params.toString()}`,
      });
      setProducts(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, lowStock, activeFilter]);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const isLowStock = (p: Product) =>
    p.variants.some((v) => v.isActive !== false && v.stock > 0 && v.stock < 10) ||
    p.variants.filter((v) => v.isActive !== false).every((v) => v.stock === 0);

  const updateVariant = (productId: string, variantId: string, updates: Partial<Variant>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId
          ? {
              ...p,
              variants: p.variants.map((v) =>
                v._id === variantId ? { ...v, ...updates } : v
              ),
            }
          : p
      )
    );
  };

  const saveProduct = async (product: Product) => {
    setSaving((prev) => ({ ...prev, [product._id]: true }));
    try {
      await apiRequest({
        method: 'PATCH',
        url: `${API_ENDPOINTS.products.LIST}/${product._id}/inventory`,
        data: {
          variants: product.variants.map((v) => ({
            variantId: v._id,
            stock: v.stock,
            isActive: v.isActive,
          })),
        },
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update inventory');
    } finally {
      setSaving((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  return (
    <div>
      <div className="sticky top-20 z-30 -mx-4 mb-6 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:py-4">
        <PageHeader
          title="Inventory Management"
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surface-hover"
              >
                Products
              </Link>
              <Link
                href="/admin/categories"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surface-hover"
              >
                Categories
              </Link>
            </div>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-4 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => setLowStock(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Low stock / in stock
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <Text className="text-text-muted">No products found.</Text>
      ) : (
        <>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-2xl border border-border bg-surface p-4 sm:p-6"
              >
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Heading level="h3" className="text-base">
                        {product.name}
                      </Heading>
                      {isLowStock(product) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-status-warning/10 px-2 py-0.5 text-xs font-medium text-status-warning">
                          <AlertTriangle className="h-3 w-3" />
                          {product.variants.some((v) => v.stock === 0) ? 'Out of stock' : 'Low stock'}
                        </span>
                      )}
                      {!product.isActive && (
                        <span className="rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-text-muted">Inactive</span>
                      )}
                    </div>
                    <Text className="text-sm text-text-muted">SKU: {product.sku}</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product._id}/edit`}
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      Edit
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => saveProduct(product)}
                      disabled={saving[product._id]}
                    >
                      {saving[product._id] ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-text-muted">
                        <th className="pb-2 font-medium">Unit</th>
                        <th className="pb-2 font-medium">Stock</th>
                        <th className="pb-2 font-medium">Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant) => (
                        <tr
                          key={variant._id}
                          className="border-b border-border/50 last:border-0"
                          style={{
                            backgroundColor: variant.stock < 10 && variant.isActive !== false ? 'rgba(245,158,11,0.05)' : undefined,
                          }}
                        >
                          <td className="py-2 pr-4">{variant.unit}</td>
                          <td className="py-2 pr-4">
                            <input
                              type="number"
                              min={0}
                              value={variant.stock}
                              onChange={(e) =>
                                updateVariant(product._id, variant._id, {
                                  stock: Number(e.target.value),
                                })
                              }
                              className="w-24 rounded-lg border border-border bg-bg px-3 py-1 text-sm"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="checkbox"
                              checked={variant.isActive}
                              onChange={(e) =>
                                updateVariant(product._id, variant._id, {
                                  isActive: e.target.checked,
                                })
                              }
                              className="h-4 w-4 rounded border-border"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
    </div>
  );
}
