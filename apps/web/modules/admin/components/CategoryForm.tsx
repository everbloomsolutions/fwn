'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Heading, Button } from '@/shared/ui';

interface Category {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
}

export default function CategoryForm({ category, isEdit }: { category?: Category; isEdit: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState<Category>(
    category || { name: '', slug: '', description: '', image: '', isActive: true }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit && form._id) {
        await apiRequest({
          method: 'PUT',
          url: `${API_ENDPOINTS.categories.LIST}/${form._id}`,
          data: form,
        });
      } else {
        await apiRequest({
          method: 'POST',
          url: API_ENDPOINTS.categories.LIST,
          data: form,
        });
      }
      router.push('/admin/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <Heading level="h2" size="compact" balance>
        {isEdit ? 'Edit Category' : 'New Category'}
      </Heading>

      {error && (
        <div className="rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Image URL</label>
          <input
            type="url"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="h-4 w-4 accent-primary"
          />
          Active
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {isEdit ? 'Update Category' : 'Create Category'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/admin/categories')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
