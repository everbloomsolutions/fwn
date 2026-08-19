'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/shared/ui';
import { useCartStore } from '@/modules/shop/stores/cartStore';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/utils/cn';
import { ShoppingCart, Heart, Star, Check, Plus, Minus } from 'lucide-react';

export interface ProductVariant {
  _id: string;
  unit: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface ProductCardProps {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  variants: ProductVariant[];
}

export function ProductCard({ product }: { product: ProductCardProps }) {
  const { success, error: showError } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const activeVariants = product.variants.filter((v) => v.isActive !== false);
  const [selectedUnit, setSelectedUnit] = useState<string>(activeVariants[0]?.unit || product.variants[0]?.unit);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.unit === selectedUnit) || product.variants[0];
  const hasStock = (variant?.stock || 0) > 0;

  const handleAdd = async () => {
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
      setAdded(true);
      success('Added to cart', `${product.name} (${variant.unit}) added to cart`);
    } catch (err) {
      showError('Failed to add', err instanceof Error ? err.message : 'Please try again');
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-3 transition-all hover:shadow-lg hover:-translate-y-1">
      <Link href={PUBLIC_ROUTES.PRODUCT(product.slug)} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-bg-muted">
          <Image
            src={product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              // Wishlist stub
            }}
            className="absolute right-2 top-2 rounded-full bg-surface/90 p-2 text-text-muted transition hover:text-primary"
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
          {!hasStock && (
            <span className="absolute left-2 top-2 rounded-full bg-error/90 px-2 py-1 text-[10px] font-medium text-white">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-center gap-0.5">
        {product.rating ? (
          <>
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
            {product.reviewCount ? <span className="text-xs text-text-muted">({product.reviewCount})</span> : null}
          </>
        ) : (
          <span className="text-xs text-text-muted">No reviews yet</span>
        )}
      </div>

      <Link href={PUBLIC_ROUTES.PRODUCT(product.slug)} className="mt-1 block">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-semibold leading-tight text-text hover:text-primary">
          {product.name}
        </h3>
      </Link>

      <div className="mt-2 text-lg font-bold text-primary">₹{variant?.price ?? product.price}</div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {activeVariants.map((v) => (
          <button
            key={v.unit}
            onClick={() => {
              setSelectedUnit(v.unit);
              setQuantity(1);
              setAdded(false);
            }}
            disabled={v.stock <= 0}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-medium transition',
              v.unit === selectedUnit
                ? 'border-primary bg-primary text-white'
                : v.stock > 0
                ? 'border-border bg-surface text-text hover:border-primary'
                : 'cursor-not-allowed border-border bg-bg text-text-muted opacity-50'
            )}
          >
            {v.unit}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-3 flex items-center gap-2">
        {added ? (
          <div className="flex flex-1 items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" /> Added
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-1 hover:bg-success/20 rounded" aria-label="Decrease">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="p-1 hover:bg-success/20 rounded" aria-label="Increase">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center rounded-lg border border-border bg-surface">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-2 py-2 hover:bg-surface-hover" aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="px-2 py-2 hover:bg-surface-hover" aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={!hasStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {hasStock ? 'Add' : 'Out of stock'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
