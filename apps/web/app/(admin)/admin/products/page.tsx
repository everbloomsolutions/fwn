'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Text, Button, EmptyState } from '@/shared/ui';
import { PageHeader } from '@/shared/ui/layout';
import { SkeletonCard } from '@/shared/ui/feedback/Skeleton';
import { DataTable } from '@/modules/admin/components/DataTable';
import { DataCard } from '@/modules/admin/components/DataCard';
import { useApi } from '@/shared/hooks';
import { useDebounce } from '@/shared/hooks';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';

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

function buildProductsUrl(page: number, search: string): string {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', '20');
  if (search.trim()) params.set('search', search.trim());
  return `${API_ENDPOINTS.products.LIST}?${params.toString()}`;
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const debouncedSearch = useDebounce(search, 300);
  const productsUrl = buildProductsUrl(page, debouncedSearch);

  const { data, isLoading, mutate } = useApi<ProductResponse>(productsUrl);
  const products = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product._id);
    try {
      await apiRequest({ method: 'DELETE', url: API_ENDPOINTS.products.DELETE(product._id) });
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const actions = (product: Product) => (
    <>
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
    </>
  );

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

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search or add a new product to get started."
          icon={<Search className="h-10 w-10 text-text-muted" />}
          action={{
            label: 'Add Product',
            onClick: () => (window.location.href = '/admin/products/new'),
          }}
        />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'name', header: 'Product', cell: (p) => (
                <div>
                  <Text className="font-medium">{p.name}</Text>
                  {!p.isActive && <span className="rounded-full bg-bg px-2 py-0.5 text-xs text-text-muted">Inactive</span>}
                </div>
              ) },
              { key: 'sku', header: 'SKU', cell: (p) => p.sku, className: 'w-32' },
              { key: 'category', header: 'Category', cell: (p) => p.category?.name || '-', className: 'w-40' },
              { key: 'price', header: 'Price', cell: (p) => `₹${p.price} / ${p.unit}`, className: 'w-28' },
              { key: 'actions', header: '', cell: (p) => <div className="flex items-center gap-2 justify-end">{actions(p)}</div>, className: 'w-44' },
            ]}
            rows={products}
            keyExtractor={(p) => p._id}
          />
          <DataCard
            rows={products}
            keyExtractor={(p) => p._id}
            fields={[
              { label: 'Product', value: (p) => (
                <div>
                  <span className="font-medium">{p.name}</span>
                  {!p.isActive && <span className="ml-2 rounded-full bg-bg px-2 py-0.5 text-xs text-text-muted">Inactive</span>}
                </div>
              ) },
              { label: 'SKU', value: (p) => p.sku },
              { label: 'Category', value: (p) => p.category?.name || '-' },
              { label: 'Price', value: (p) => `₹${p.price} / ${p.unit}` },
            ]}
            actions={actions}
          />

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
        </>
      )}
    </div>
  );
}
