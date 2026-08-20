'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Text, EmptyState } from '@/shared/ui';
import { PageHeader } from '@/shared/ui/layout';
import { SkeletonCard } from '@/shared/ui/feedback/Skeleton';
import { DataTable } from '@/modules/admin/components/DataTable';
import { DataCard } from '@/modules/admin/components/DataCard';
import { Loader2, Plus } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface CategoryResponse {
  success: boolean;
  data: Category[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await apiRequest<CategoryResponse>({ method: 'GET', url: API_ENDPOINTS.categories.LIST });
      setCategories(res.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await apiRequest({ method: 'DELETE', url: `${API_ENDPOINTS.categories.LIST}/${id}` });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const actions = (category: Category) => (
    <div className="flex items-center gap-3">
      {!category.isActive && (
        <span className="rounded-full bg-bg px-2 py-0.5 text-xs text-text-muted">Inactive</span>
      )}
      <Link
        href={`/admin/categories/${category._id}/edit`}
        className="text-sm font-medium text-primary hover:text-primary-hover"
      >
        Edit
      </Link>
      <button
        onClick={() => deleteCategory(category._id)}
        className="text-sm font-medium text-status-error hover:text-status-error/80"
      >
        Delete
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Categories"
        action={
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Add Category
          </Link>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Add a category to organize your products."
          icon={<Plus className="h-10 w-10 text-text-muted" />}
          action={{ label: 'Add Category', onClick: () => (window.location.href = '/admin/categories/new') }}
        />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'name', header: 'Name', cell: (c) => (
                <div>
                  <Text className="font-medium">{c.name}</Text>
                  {!c.isActive && <span className="rounded-full bg-bg px-2 py-0.5 text-xs text-text-muted">Inactive</span>}
                </div>
              ) },
              { key: 'slug', header: 'Slug', cell: (c) => `/${c.slug}`, className: 'w-1/3' },
              { key: 'actions', header: '', cell: (c) => <div className="text-right">{actions(c)}</div>, className: 'w-40' },
            ]}
            rows={categories}
            keyExtractor={(c) => c._id}
          />
          <DataCard
            rows={categories}
            keyExtractor={(c) => c._id}
            fields={[
              { label: 'Name', value: (c) => c.name },
              { label: 'Slug', value: (c) => `/${c.slug}` },
            ]}
            actions={actions}
          />
        </>
      )}
    </div>
  );
}
