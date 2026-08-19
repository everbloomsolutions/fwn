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
import { SuggestedProducts } from '@/modules/shop/components/SuggestedProducts';
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
  category: { _id: string; name: string; slug: string };
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
        const active = prod.variants.filter((v) => v.isActive !== false);
        setSelectedUnit(active[0]?.unit || prod.variants[0]?.unit);
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
  const hasStock = (variant?.stock || 0) > 0;

  const handleAddToCart = async () => {
    if (!variant || !hasStock) {
      showError('Out of stock', `Only ${variant?.stock || 0} units available`);
      return;
    }
    if (variant.stock < quantity) {
      showError('Not enough stock', `Only ${variant.stock} units available for ${variant.unit}`);
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
    if (!variant || !hasStock) {
      showError('Out of stock', `Only ${variant?.stock || 0} units available`);
      return;
    }
    if (variant.stock < quantity) {
      showError('Not enough stock', `Only ${variant.stock} units available for ${variant.unit}`);
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
    <Container maxWidth="xl" className="py-6 sm:py-12 lg:py-16">
      <nav className="mb-4 flex flex-wrap gap-1 text-sm text-text-muted" aria-label="Breadcrumb">
        <Link href={PUBLIC_ROUTES.HOME} className="hover:text-primary">Home</Link>
        <span className="text-border">/</span>
        <Link href={PUBLIC_ROUTES.SHOP} className="hover:text-primary">Shop</Link>
        <span className="text-border">/</span>
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link>
        <span className="text-border">/</span>
        <span className="line-clamp-1 max-w-[200px] text-text">{product.name}</span>
      </nav>

      <Link
        href={PUBLIC_ROUTES.SHOP}
        className="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-bg-muted">
          <Image
            src={product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="flex flex-col">
          <Text className="text-sm text-text-muted uppercase tracking-wide">{product.category.name}</Text>
          <Heading level="h1" balance className="mb-2 mt-2 text-2xl sm:text-3xl">
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
                  disabled={v.stock <= 0}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                    v.unit === selectedUnit
                      ? 'border-primary bg-primary text-white'
                      : v.stock > 0
                      ? 'border-border bg-surface text-text hover:border-primary'
                      : 'cursor-not-allowed border-border bg-bg text-text-muted opacity-50'
                  )}
                >
                  {v.unit} - ₹{v.price}
                </button>
              ))}
          </div>

          <Text className="mt-4 line-clamp-4 text-sm leading-relaxed text-text-muted sm:text-base sm:leading-relaxed">
            {product.description}
          </Text>

          <div className="mt-4 flex flex-wrap gap-2">
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
            <div className="mt-4 sm:mt-6">
              <Heading level="h3" className="mb-1 text-base">
                Ingredients
              </Heading>
              <Text className="text-text-muted">{product.ingredients.join(', ')}</Text>
            </div>
          )}

          {product.nutrition && Object.keys(product.nutrition).length > 0 && (
            <Card className="mt-4 sm:mt-6">
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

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
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
              disabled={!hasStock}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover disabled:opacity-50 sm:flex-none"
            >
              <ShoppingCart className="h-5 w-5" />
              {hasStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!hasStock}
              className="inline-flex w-full flex-1 items-center justify-center gap-2 rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/5 disabled:opacity-50 sm:w-auto sm:flex-none"
            >
              <Zap className="h-5 w-5" />
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <SuggestedProducts
        title="You may also like"
        categoryId={product.category._id}
        excludeIds={[product._id]}
        limit={4}
      />

      <BackToTop />
    </Container>
  );
}
