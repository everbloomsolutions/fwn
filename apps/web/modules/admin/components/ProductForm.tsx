'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Heading, Text, Button } from '@/shared/ui';
import { Loader2, Plus, Trash2, RefreshCw } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface ProductVariant {
  _id?: string;
  sku: string;
  quantity: number;
  measurement: 'g' | 'kg' | 'ml' | 'ltr' | 'pcs' | 'unit';
  price: number;
  stock: number;
  mrp?: number;
  isActive: boolean;
  position: number;
}

interface Product {
  _id?: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  images: string[];
  tags: string[];
  ingredients: string[];
  certifications: string[];
  isActive: boolean;
  nutrition: Record<string, string>;
  variants: ProductVariant[];
}

const MEASUREMENTS: ProductVariant['measurement'][] = ['g', 'kg', 'ml', 'ltr', 'pcs', 'unit'];

function generateVariantSKU(baseSku: string, quantity: number, measurement: string) {
  const clean = baseSku.trim();
  if (!clean || !quantity || !measurement) return '';
  return `${clean}-${quantity}${measurement}`;
}

function emptyProduct(): Product {
  return {
    sku: '',
    name: '',
    slug: '',
    description: '',
    category: '',
    images: [''],
    tags: [],
    ingredients: [],
    certifications: [],
    isActive: true,
    nutrition: { energy: '', protein: '', fat: '', carbs: '' },
    variants: [
      {
        sku: '',
        quantity: 1,
        measurement: 'kg',
        price: 0,
        stock: 0,
        isActive: true,
        position: 0,
      },
    ],
  };
}

export default function ProductForm({ product, categories, isEdit }: { product?: Product; categories: Category[]; isEdit: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState<Product>(product ? { ...product } : emptyProduct());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!form.sku) return;
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) => ({
        ...v,
        sku: generateVariantSKU(f.sku, v.quantity, v.measurement),
      })),
    }));
  }, [form.sku]);

  const setBase = (key: keyof Product, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const setArrayField = (key: 'images' | 'tags' | 'ingredients' | 'certifications', value: string) =>
    setForm((f) => ({ ...f, [key]: value.split(',').map((s) => s.trim()).filter(Boolean) }));

  const setNutrition = (key: string, value: string) =>
    setForm((f) => ({ ...f, nutrition: { ...f.nutrition, [key]: value } }));

  const setVariant = (idx: number, key: keyof ProductVariant, value: unknown) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => {
        if (i !== idx) return v;
        const next = { ...v, [key]: value } as ProductVariant;
        if ((key === 'quantity' || key === 'measurement') && f.sku) {
          next.sku = generateVariantSKU(f.sku, next.quantity, next.measurement);
        }
        return next;
      }),
    }));

  const regenerateSKUs = () =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) => ({
        ...v,
        sku: generateVariantSKU(f.sku, v.quantity, v.measurement),
      })),
    }));

  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [
        ...f.variants,
        {
          sku: generateVariantSKU(f.sku, 1, 'kg'),
          quantity: 1,
          measurement: 'kg',
          price: 0,
          stock: 0,
          isActive: true,
          position: f.variants.length,
        },
      ],
    }));

  const removeVariant = (idx: number) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== idx),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const skus = form.variants.map((v) => v.sku.trim()).filter(Boolean);
    const duplicate = skus.find((s, i) => skus.indexOf(s) !== i);
    if (duplicate) {
      setError(`Duplicate variant SKU: ${duplicate}`);
      setLoading(false);
      return;
    }

    try {
      const data = { ...form };
      if (isEdit && form._id) {
        await apiRequest({
          method: 'PUT',
          url: API_ENDPOINTS.products.UPDATE(form._id),
          data,
        });
      } else {
        await apiRequest({
          method: 'POST',
          url: API_ENDPOINTS.products.CREATE,
          data,
        });
      }
      router.push('/admin/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Heading level="h2" size="compact" balance>
        {isEdit ? 'Edit Product' : 'New Product'}
      </Heading>

      {error && (
        <div className="rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <Heading level="h3" size="compact" className="mb-4 text-base">
          Basic Details
        </Heading>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setBase('name', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <input
              required
              value={form.slug}
              onChange={(e) => setBase('slug', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">SKU</label>
            <input
              required
              value={form.sku}
              onChange={(e) => setBase('sku', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              required
              value={form.category}
              onChange={(e) => setBase('category', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setBase('description', e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <Heading level="h3" size="compact" className="mb-4 text-base">
          Media & Tags
        </Heading>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Image URLs (comma separated)</label>
            <input
              value={form.images.join(', ')}
              onChange={(e) => setArrayField('images', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tags (comma separated)</label>
            <input
              value={form.tags.join(', ')}
              onChange={(e) => setArrayField('tags', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ingredients (comma separated)</label>
            <input
              value={form.ingredients.join(', ')}
              onChange={(e) => setArrayField('ingredients', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Certifications (comma separated)</label>
            <input
              value={form.certifications.join(', ')}
              onChange={(e) => setArrayField('certifications', e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <Heading level="h3" size="compact" className="mb-4 text-base">
          Nutrition (per 100g)
        </Heading>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.keys(form.nutrition).map((key) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium capitalize">{key}</label>
              <input
                value={form.nutrition[key]}
                onChange={(e) => setNutrition(key, e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <Heading level="h3" size="compact" className="text-base">
            Variants
          </Heading>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={regenerateSKUs} disabled={!form.sku}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Regenerate SKUs
            </Button>
            <Button type="button" size="sm" onClick={addVariant}>
              <Plus className="mr-1 h-4 w-4" />
              Add Variant
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {form.variants.map((variant, idx) => (
            <div
              key={idx}
              className="grid gap-3 rounded-xl border border-border bg-bg p-3 sm:grid-cols-6"
            >
              <div>
                <label className="mb-1 block text-xs font-medium">Qty</label>
                <input
                  type="number"
                  required
                  min={0.01}
                  step="any"
                  value={variant.quantity}
                  onChange={(e) => setVariant(idx, 'quantity', Number(e.target.value))}
                  className="w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Unit</label>
                <select
                  value={variant.measurement}
                  onChange={(e) => setVariant(idx, 'measurement', e.target.value)}
                  className="w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                >
                  {MEASUREMENTS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Price (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={variant.price}
                  onChange={(e) => setVariant(idx, 'price', Number(e.target.value))}
                  className="w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Stock</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={variant.stock}
                  onChange={(e) => setVariant(idx, 'stock', Number(e.target.value))}
                  className="w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex items-end gap-3 sm:col-span-2">
                <label className="mb-1 flex h-9 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={variant.isActive}
                    onChange={(e) => setVariant(idx, 'isActive', e.target.checked)}
                    className="h-4 w-4"
                  />
                  Active
                </label>
                {form.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="ml-auto inline-flex h-9 items-center justify-center rounded-lg border border-border bg-surface p-2 text-status-error hover:bg-surface-hover"
                    title="Remove variant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="sm:col-span-6">
                <Text className="text-xs text-text-muted">
                  Generated SKU: <span className="font-mono text-text">{variant.sku}</span>
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setBase('isActive', e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Product is active
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/admin/inventory')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
