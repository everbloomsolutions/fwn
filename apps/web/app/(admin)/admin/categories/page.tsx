'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Heading, Text, Button } from '@/shared/ui';
import { Loader2 } from 'lucide-react';

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Heading level="h2" size="compact" balance>
          Categories
        </Heading>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Add Category
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <Text className="text-text-muted">No categories found.</Text>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
            >
              <div>
                <Text className="font-medium">{c.name}</Text>
                <Text className="text-sm text-text-muted">/{c.slug}</Text>
              </div>
              <div className="flex items-center gap-3">
                {!c.isActive && (
                  <span className="rounded-full bg-bg px-2 py-0.5 text-xs text-text-muted">Inactive</span>
                )}
                <Link href={`/admin/categories/${c._id}/edit`} className="text-sm text-primary hover:text-primary-hover">
                  Edit
                </Link>
                <button
                  onClick={() => deleteCategory(c._id)}
                  className="text-sm text-status-error hover:text-status-error/80"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
