'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { Container, Heading, Text, Card, CardContent, CardHeader, CardTitle, BackToTop } from '@/shared/ui';

import { ShoppingCart } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  category: { name: string };
}

interface ProductResponse {
  success: boolean;
  data: Product[];
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await apiRequest<ProductResponse>({
          method: 'GET',
          url: API_ENDPOINTS.products.LIST,
        });
        setProducts(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Text className="text-text-muted">Loading products...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Text className="text-error">{error}</Text>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8 sm:py-12 lg:py-16">
      <div className="text-center mb-12">
        <Heading level="h1" className="mb-4">
          Shop Natural Foods
        </Heading>
        <Text className="mx-auto max-w-2xl text-text-muted">
          Browse our collection of natural, wholesome food products sourced responsibly for you.
        </Text>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Text className="text-text-muted">No products available yet. Please check back soon.</Text>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(product => (
            <Card key={product._id} className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
              <Link href={PUBLIC_ROUTES.PRODUCT(product.slug)}>
                <div className="relative h-56 w-full overflow-hidden bg-bg-muted">
                  <Image
                    src={product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </Link>
              <CardHeader className="pb-2">
                <Text className="text-xs text-text-muted uppercase tracking-wide">{product.category.name}</Text>
                <CardTitle className="text-lg">
                  <Link href={PUBLIC_ROUTES.PRODUCT(product.slug)} className="hover:text-primary">
                    {product.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Text className="font-semibold text-primary">
                    ₹{product.price} <span className="text-sm font-normal text-text-muted">/ {product.unit}</span>
                  </Text>
                  <Link
                    href={PUBLIC_ROUTES.PRODUCT(product.slug)}
                    className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    View
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BackToTop />
    </Container>
  );
}
