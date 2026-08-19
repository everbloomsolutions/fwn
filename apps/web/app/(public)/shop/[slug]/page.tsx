'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { Container, Heading, Text, Card, CardContent, BackToTop } from '@/shared/ui';
import { useToast } from '@/shared/ui';
import { useCartStore } from '@/modules/shop/stores/cartStore';
import { Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  ingredients?: string[];
  certifications?: string[];
  nutrition?: Record<string, string>;
  category: { name: string };
}

interface ProductResponse {
  success: boolean;
  data: Product;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const addItem = useCartStore(state => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      try {
        const slug = params?.slug as string;
        const response = await apiRequest<ProductResponse>({
          method: 'GET',
          url: API_ENDPOINTS.products.DETAIL(slug),
        });
        setProduct(response.data);
      } catch (err) {
        showError('Failed to load product', err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params, showError]);

  if (loading) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Text className="text-text-muted">Loading product...</Text>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Text className="text-error">Product not found</Text>
      </Container>
    );
  }

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      showError('Out of stock', 'The selected quantity is not available.');
      return;
    }
    addItem(
      {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        unit: product.unit,
        images: product.images,
      },
      quantity
    );
    success('Added to cart', `${quantity} × ${product.name} added to your cart.`);
  };

  return (
    <Container maxWidth="xl" className="py-8 sm:py-12 lg:py-16">
      <Link
        href={PUBLIC_ROUTES.SHOP}
        className="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-bg-muted">
          <Image
            src={product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div>
          <Text className="text-sm text-text-muted uppercase tracking-wide">{product.category.name}</Text>
          <Heading level="h1" className="mb-4 mt-2">
            {product.name}
          </Heading>
          <Text className="text-2xl font-semibold text-primary">
            ₹{product.price} <span className="text-base font-normal text-text-muted">/ {product.unit}</span>
          </Text>

          <Text className="mt-6 leading-relaxed text-text-muted">{product.description}</Text>

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mt-6">
              <Heading level="h3" className="mb-2 text-base">
                Ingredients
              </Heading>
              <Text className="text-text-muted">{product.ingredients.join(', ')}</Text>
            </div>
          )}

          {product.certifications && product.certifications.length > 0 && (
            <div className="mt-6">
              <Heading level="h3" className="mb-2 text-base">
                Certifications
              </Heading>
              <Text className="text-text-muted">{product.certifications.join(', ')}</Text>
            </div>
          )}

          {product.nutrition && Object.keys(product.nutrition).length > 0 && (
            <Card className="mt-6">
              <CardContent>
                <Heading level="h3" className="mb-3 text-base">
                  Nutrition Info
                </Heading>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.nutrition).map(([key, value]) => (
                    <div key={key}>
                      <Text className="text-xs text-text-muted capitalize">{key}</Text>
                      <Text className="font-medium">{value}</Text>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-lg border border-border bg-surface">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-3 hover:bg-surface-hover"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="p-3 hover:bg-surface-hover"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>

            <button
              onClick={() => router.push(PUBLIC_ROUTES.CART)}
              className="inline-flex items-center gap-2 rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/5"
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>
      <BackToTop />
    </Container>
  );
}
