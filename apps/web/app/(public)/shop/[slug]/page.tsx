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
import { TRUST_BADGES } from '@/shared/config/shop';
import { Minus, Plus, ShoppingCart, ArrowLeft, Star, Check, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';

interface ProductVariant {
  _id: string;
  unit: string;
  price: number;
  stock: number;
  isActive: boolean;
}

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
  rating?: number;
  reviewCount?: number;
  category: { name: string };
  variants: ProductVariant[];
}

interface ProductResponse {
  success: boolean;
  data: Product;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  useEffect(() => {
    async function loadProduct() {
      try {
        const slug = params?.slug as string;
        const response = await apiRequest<ProductResponse>({
          method: 'GET',
          url: API_ENDPOINTS.products.DETAIL(slug),
        });
        const prod = response.data;
        setProduct(prod);
        const first = prod.variants.find((v) => v.isActive !== false) || prod.variants[0];
        setSelectedUnit(first?.unit || prod.unit);
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

  const variant = product.variants.find((v) => v.unit === selectedUnit) || product.variants[0];

  const handleAddToCart = async () => {
    if (!variant || variant.stock < quantity) {
      showError('Out of stock', `Only ${variant?.stock || 0} units available`);
      return;
    }
    try {
      await addItem(product._id, variant._id, product.name, variant.unit, variant.price, quantity, product.images[0]);
      success('Added to cart', `${product.name} (${variant.unit}) added to cart`);
    } catch (err) {
      showError('Failed to add', err instanceof Error ? err.message : 'Please try again');
    }
  };

  const handleBuyNow = async () => {
    if (!variant || variant.stock < quantity) {
      showError('Out of stock', `Only ${variant?.stock || 0} units available`);
      return;
    }
    try {
      await addItem(product._id, variant._id, product.name, variant.unit, variant.price, quantity, product.images[0]);
      router.push(PUBLIC_ROUTES.CHECKOUT);
    } catch (err) {
      showError('Failed to add', err instanceof Error ? err.message : 'Please try again');
    }
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
          <Heading level="h1" className="mb-2 mt-2">
            {product.name}
          </Heading>

          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className={cn('h-4 w-4', product.rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted')} />
              <span className="text-sm font-medium">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
            </div>
            {product.reviewCount ? (
              <span className="text-sm text-text-muted">({product.reviewCount} reviews)</span>
            ) : (
              <span className="text-sm text-text-muted">No reviews yet</span>
            )}
          </div>

          <Text className="text-2xl font-semibold text-primary">₹{variant?.price ?? product.price}</Text>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.variants
              .filter((v) => v.isActive !== false)
              .map((v) => (
                <button
                  key={v.unit}
                  onClick={() => {
                    setSelectedUnit(v.unit);
                    setQuantity(1);
                  }}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                    v.unit === selectedUnit
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-surface text-text hover:border-primary'
                  )}
                >
                  {v.unit} - ₹{v.price}
                </button>
              ))}
          </div>

          <Text className="mt-6 leading-relaxed text-text-muted">{product.description}</Text>

          <div className="mt-6 flex flex-wrap gap-2">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                <Check className="h-3.5 w-3.5" />
                {badge}
              </span>
            ))}
          </div>

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mt-6">
              <Heading level="h3" className="mb-2 text-base">
                Ingredients
              </Heading>
              <Text className="text-text-muted">{product.ingredients.join(', ')}</Text>
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
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 hover:bg-surface-hover"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => (variant ? Math.min(variant.stock, q + 1) : q + 1))}
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
              onClick={handleBuyNow}
              className="inline-flex items-center gap-2 rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/5"
            >
              <Zap className="h-5 w-5" />
              Buy Now
            </button>
          </div>
        </div>
      </div>
      <BackToTop />
    </Container>
  );
}
