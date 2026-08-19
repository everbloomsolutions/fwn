'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/modules/shop/stores/cartStore';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { FREE_SHIPPING_THRESHOLD } from '@/shared/config/shop';
import { cn } from '@/shared/utils/cn';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Truck, Loader2 } from 'lucide-react';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { items, totalItems, subtotal, freeShippingProgress, remainingForFreeShipping, isFreeShipping, loadCart, updateQuantity, removeItem, isLoading } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen, loadCart]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-surface shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold text-text">Your Cart ({totalItems})</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-text-muted hover:bg-surface-hover hover:text-text"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
                <ShoppingBag className="h-10 w-10 text-text-muted" />
                <p className="text-text-muted">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-3 rounded-xl border border-border p-3">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-bg-muted">
                      <Image
                        src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="font-medium text-text">{item.name}</p>
                        <p className="text-xs text-text-muted">{item.unit}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-primary">₹{item.unitPrice * item.quantity}</p>
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1.5 hover:bg-surface-hover"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-1.5 hover:bg-surface-hover"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-xs text-text-muted underline hover:text-error"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {items.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-bg p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-text-muted">
                    {isFreeShipping ? 'You unlocked free shipping!' : `₹${subtotal} / ₹${FREE_SHIPPING_THRESHOLD}`}
                  </span>
                  <Truck className="h-4 w-4 text-text-muted" />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
                {!isFreeShipping && (
                  <p className="mt-2 text-xs text-text-muted">
                    Add ₹{remainingForFreeShipping} more for free shipping
                  </p>
                )}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-border p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-lg font-bold text-text">₹{subtotal}</span>
              </div>
              <div className="grid gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-hover"
                >
                  Continue Shopping
                </button>
                <Link
                  href={PUBLIC_ROUTES.CART}
                  onClick={onClose}
                  className="rounded-lg border border-border bg-surface px-4 py-2.5 text-center text-sm font-medium text-text hover:bg-surface-hover"
                >
                  View Cart
                </Link>
                <Link
                  href={PUBLIC_ROUTES.CHECKOUT}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
