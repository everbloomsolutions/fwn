'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container, Heading, Text, Card, CardContent, BackToTop } from '@/shared/ui';
import { useCartStore } from '@/modules/shop/stores/cartStore';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { FREE_SHIPPING_THRESHOLD } from '@/shared/config/shop';
import { Minus, Plus, Trash2, ShoppingBag, Truck, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, totalItems, freeShippingProgress, remainingForFreeShipping, isFreeShipping, loadCart } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  if (items.length === 0) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Heading level="h1" className="mb-4">
          Your Cart is Empty
        </Heading>
        <Text className="mb-8 text-text-muted">
          Looks like you have not added any natural goodies yet.
        </Text>
        <Link
          href={PUBLIC_ROUTES.SHOP}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary-hover"
        >
          <ShoppingBag className="h-5 w-5" />
          Start Shopping
        </Link>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8 sm:py-12 lg:py-16">
      <Heading level="h1" className="mb-8">
        Shopping Cart ({totalItems})
      </Heading>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.variantId} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-bg-muted">
                <Image
                  src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop'}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              <div className="flex-1">
                <Heading level="h3" className="text-base">
                  {item.name}
                </Heading>
                <Text className="text-sm text-text-muted">
                  ₹{item.unitPrice} / {item.unit}
                </Text>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-border bg-surface">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="p-2 hover:bg-surface-hover"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="p-2 hover:bg-surface-hover"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Text className="w-20 text-right font-semibold">
                  ₹{item.unitPrice * item.quantity}
                </Text>

                <button
                  onClick={() => removeItem(item.variantId)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="h-fit">
            <CardContent className="space-y-4">
              <Heading level="h2" className="text-xl">
                Order Summary
              </Heading>
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Shipping</span>
                <span>{isFreeShipping ? 'Free' : 'Calculated at checkout'}</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>
              <button
                onClick={() => router.push(PUBLIC_ROUTES.CHECKOUT)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary-hover"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Truck className="h-4 w-4" />
                <span>Free shipping over ₹{FREE_SHIPPING_THRESHOLD}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
              {!isFreeShipping && (
                <p className="text-xs text-text-muted">Add ₹{remainingForFreeShipping} more for free shipping</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <BackToTop />
    </Container>
  );
}
