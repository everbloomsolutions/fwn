'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Heading, Text, Button } from '@/shared/ui';
import { Loader2 } from 'lucide-react';

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
  variants: Variant[];
}

interface ProductResponse {
  success: boolean;
  data: Product[];
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<ProductResponse>({
          method: 'GET',
          url: API_ENDPOINTS.products.LIST,
        });
        setProducts(res.data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Heading level="h2" size="compact" balance className="mb-6">
        Inventory Management
      </Heading>

      <div className="space-y-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="rounded-2xl border border-border bg-surface p-4 sm:p-6"
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Heading level="h3" className="text-base">
                  {product.name}
                </Heading>
                <Text className="text-sm text-text-muted">SKU: {product.sku}</Text>
              </div>
              <Button
                size="sm"
                onClick={() => saveProduct(product)}
                disabled={saving[product._id]}
              >
                {saving[product._id] ? 'Saving...' : 'Save Changes'}
              </Button>
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
                    <tr key={variant._id} className="border-b border-border/50 last:border-0">
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
    </div>
  );
}
