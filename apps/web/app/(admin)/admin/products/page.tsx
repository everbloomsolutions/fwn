'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Heading, Text, Button } from '@/shared/ui';
import { PageHeader } from '@/shared/ui/layout';
import { Loader2, Search, Pencil, Trash2, Plus } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  isActive: boolean;
  category?: { name: string };
  price: number;
  unit: string;
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ProductResponse['pagination']>({ total: 0, page: 1, limit: 20, totalPages: 1 });

  async function loadProducts() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search.trim()) params.set('search', search.trim());
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
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product._id);
    try {
      await apiRequest({ method: 'DELETE', url: API_ENDPOINTS.products.DELETE(product._id) });
      await loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        }
      />

      <div className="sticky top-20 z-30 -mx-4 mb-6 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-4 text-sm text-text outline-none focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <Text className="text-text-muted">No products found.</Text>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Heading level="h3" size="compact" className="text-base">
                    {product.name}
                  </Heading>
                  {!product.isActive && (
                    <span className="rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-text-muted">Inactive</span>
                  )}
                </div>
                <Text className="text-sm text-text-muted">
                  SKU: {product.sku} · {product.category?.name || 'No category'} · ₹{product.price} / {product.unit}
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/products/${product._id}/edit`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-surface-hover"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDelete(product)}
                  disabled={deleting === product._id}
                  className="inline-flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting === product._id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Text className="text-sm text-text-muted">
            {pagination.total} products · page {pagination.page} of {pagination.totalPages}
          </Text>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-hover disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-text-muted">{page} / {pagination.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-hover disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
