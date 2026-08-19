'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Heading, Text, Card, CardContent, BackToTop } from '@/shared/ui';
import { useToast } from '@/shared/ui';
import { useCartStore } from '@/modules/shop/stores/cartStore';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { API_ENDPOINTS } from '@/shared/config/api';
import { apiRequest } from '@/shared/core/http/apiClient';
import Link from 'next/link';

interface OrderResponse {
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    total: number;
    razorpayOrderId?: string;
  };
  message?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { items, subtotal, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  if (items.length === 0) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Heading level="h1" className="mb-4">
          Your Cart is Empty
        </Heading>
        <Text className="mb-8 text-text-muted">Add products to your cart before checkout.</Text>
        <Link
          href={PUBLIC_ROUTES.SHOP}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary-hover"
        >
          Continue Shopping
        </Link>
      </Container>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiRequest<OrderResponse>({
        method: 'POST',
        url: API_ENDPOINTS.orders.CREATE,
        data: {
          items: items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            unit: item.product.unit,
          })),
          shippingAddress: form,
        },
      });

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (razorpayKey && response.data.razorpayOrderId && typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Razorpay) {
        const options = {
          key: razorpayKey,
          amount: response.data.total * 100,
          currency: 'INR',
          name: 'Foodworld Naturals',
          description: `Order ${response.data.orderNumber}`,
          order_id: response.data.razorpayOrderId,
          handler: () => {
            success('Payment successful', `Order ${response.data.orderNumber} placed successfully!`);
            clearCart();
            router.push(PUBLIC_ROUTES.HOME);
          },
          prefill: {
            name: form.name,
            contact: form.phone,
          },
          theme: { color: '#10b981' },
        };
        const rzp = new ((window as unknown as Record<string, unknown>).Razorpay as { new (opts: typeof options): { open: () => void } })(options);
        rzp.open();
      } else {
        success('Order placed', `Order ${response.data.orderNumber} created. Razorpay payment will be enabled once the key is configured.`);
        clearCart();
        router.push(PUBLIC_ROUTES.HOME);
      }
    } catch (err) {
      showError('Checkout failed', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" className="py-8 sm:py-12 lg:py-16">
      <Heading level="h1" className="mb-8">
        Checkout
      </Heading>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="mb-1 block text-sm font-medium">
                  Address
                </label>
                <textarea
                  id="address"
                name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Street, locality, landmark"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="city" className="mb-1 block text-sm font-medium">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Bangalore"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="mb-1 block text-sm font-medium">
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Karnataka"
                  />
                </div>
                <div>
                  <label htmlFor="pincode" className="mb-1 block text-sm font-medium">
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="560034"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {submitting ? 'Placing Order...' : `Pay ₹${subtotal}`}
              </button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="space-y-4">
            <Heading level="h2" className="text-xl">
              Order Summary
            </Heading>
            {items.map(item => (
              <div key={item.product.slug} className="flex justify-between text-sm">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium">₹{item.product.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>
            <Text className="text-sm text-text-muted">
              Shipping and tax are currently set to zero and will be configured before the store goes live.
            </Text>
          </CardContent>
        </Card>
      </div>
      <BackToTop />
    </Container>
  );
}
