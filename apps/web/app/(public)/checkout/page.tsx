'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Heading, Text, Card, CardContent, BackToTop } from '@/shared/ui';
import { useToast } from '@/shared/ui';
import { useCartStore } from '@/modules/shop/stores/cartStore';
import { PUBLIC_ROUTES } from '@/shared/config/routes';
import { API_ENDPOINTS } from '@/shared/config/api';
import { FREE_SHIPPING_THRESHOLD } from '@/shared/config/shop';
import { apiRequest } from '@/shared/core/http/apiClient';
import { cn } from '@/shared/utils/cn';
import { Truck, MapPin, CreditCard, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface OrderResponse {
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    total: number;
    paymentMethod: string;
    razorpayOrderId?: string;
  };
  message?: string;
}

type CheckoutStep = 'address' | 'delivery' | 'payment';
type PaymentMethod = 'cod' | 'razorpay' | 'upi';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}

const steps: { key: CheckoutStep; label: string; icon: React.ElementType }[] = [
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'delivery', label: 'Delivery', icon: Truck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { items, subtotal, totalItems, freeShippingProgress, remainingForFreeShipping, isFreeShipping, clearCart, loadCart } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>('address');
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    deliveryNotes: '',
  });

  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (paymentMethod !== 'cod' && razorpayKey) {
      loadRazorpayScript().catch((err) => console.warn('Razorpay script load failed:', err));
    }
  }, [paymentMethod, razorpayKey]);

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
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const canProceed = {
    address: form.name && form.email && form.phone && form.address && form.city && form.state && form.pincode,
    delivery: true,
    payment: true,
  };

  const openRazorpay = (order: OrderResponse['data']) => {
    if (!window.Razorpay || !razorpayKey) {
      showError('Payment unavailable', 'Razorpay is not configured. Please choose COD.');
      return;
    }

    const options = {
      key: razorpayKey,
      amount: order.total * 100,
      currency: 'INR',
      name: 'Foodworld Naturals',
      description: `Order ${order.orderNumber}`,
      order_id: order.razorpayOrderId,
      handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string }) => {
        try {
          await apiRequest({
            method: 'PATCH',
            url: API_ENDPOINTS.orders.PAYMENT,
            data: {
              orderNumber: order.orderNumber,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              status: 'success',
            },
          });
          success('Payment successful', `Order ${order.orderNumber} placed!`);
          clearCart();
          router.push(`${PUBLIC_ROUTES.HOME}?orderNumber=${order.orderNumber}`);
        } catch (err) {
          showError('Payment confirmation failed', err instanceof Error ? err.message : 'Please contact support');
        }
      },
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: '#10b981' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const placeOrder = async () => {
    setSubmitting(true);
    try {
      const response = await apiRequest<OrderResponse>({
        method: 'POST',
        url: API_ENDPOINTS.orders.CREATE,
        data: {
          items: items.map((item) => ({
            product: item.productId,
            variant: item.variantId,
            name: item.name,
            price: item.unitPrice,
            quantity: item.quantity,
            unit: item.unit,
          })),
          shippingAddress: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          paymentMethod,
          deliveryNotes: form.deliveryNotes,
        },
      });

      const order = response.data;

      if (paymentMethod === 'razorpay' || paymentMethod === 'upi') {
        openRazorpay(order);
      } else {
        success('Order placed', `Order ${order.orderNumber} placed. Pay ₹${order.total} on delivery.`);
        clearCart();
        router.push(`${PUBLIC_ROUTES.HOME}?orderNumber=${order.orderNumber}`);
      }
    } catch (err) {
      showError('Checkout failed', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const StepIndicator = () => (
    <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((s, idx) => {
        const Icon = s.icon;
        const active = s.key === step;
        const completed = steps.findIndex((x) => x.key === step) > idx;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition',
                active ? 'bg-primary text-white' : completed ? 'bg-primary/10 text-primary' : 'bg-surface text-text-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {idx < steps.length - 1 && <div className="h-px w-4 bg-border sm:w-8" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <Container maxWidth="xl" className="py-8 sm:py-12 lg:py-16">
      <Heading level="h1" className="mb-4 text-center">
        Checkout
      </Heading>
      <StepIndicator />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 'address' && (
            <Card>
              <CardContent className="space-y-4">
                <Heading level="h2" className="text-xl">
                  Shipping Address
                </Heading>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Full Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                    placeholder="Street, locality, landmark"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">City</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                      placeholder="Hyderabad"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">State</label>
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                      placeholder="Telangana"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Pincode</label>
                    <input
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                      placeholder="500049"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'delivery' && (
            <Card>
              <CardContent className="space-y-4">
                <Heading level="h2" className="text-xl">
                  Delivery
                </Heading>
                <div className="rounded-xl border border-border bg-bg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">
                      {isFreeShipping ? 'Free shipping unlocked' : `₹${subtotal} / ₹${FREE_SHIPPING_THRESHOLD}`}
                    </span>
                    <Truck className="h-4 w-4 text-text-muted" />
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                  {!isFreeShipping && (
                    <p className="mt-2 text-xs text-text-muted">Add ₹{remainingForFreeShipping} more for free shipping</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Delivery Notes (optional)</label>
                  <textarea
                    name="deliveryNotes"
                    value={form.deliveryNotes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                    placeholder="Ring bell, leave at gate, etc."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'payment' && (
            <Card>
              <CardContent className="space-y-4">
                <Heading level="h2" className="text-xl">
                  Payment Method
                </Heading>

                <div className="space-y-3">
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition',
                      paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border bg-surface'
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 accent-primary"
                    />
                    <div>
                      <p className="font-medium text-text">Cash on Delivery</p>
                      <p className="text-sm text-text-muted">Pay when you receive your order</p>
                    </div>
                  </label>

                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition',
                      paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-border bg-surface'
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="h-4 w-4 accent-primary"
                    />
                    <div>
                      <p className="font-medium text-text">UPI / Card / Net Banking</p>
                      <p className="text-sm text-text-muted">Secure online payment via Razorpay</p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex items-center justify-between">
            {step !== 'address' ? (
              <button
                onClick={() => {
                  const prev = steps[steps.findIndex((s) => s.key === step) - 1].key;
                  setStep(prev);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text hover:bg-surface-hover"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <Link
                href={PUBLIC_ROUTES.CART}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text hover:bg-surface-hover"
              >
                <ArrowLeft className="h-4 w-4" />
                Cart
              </Link>
            )}

            {step !== 'payment' ? (
              <button
                onClick={() => {
                  const next = steps[steps.findIndex((s) => s.key === step) + 1].key;
                  setStep(next);
                }}
                disabled={!canProceed[step]}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={placeOrder}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Place Order
              </button>
            )}
          </div>
        </div>

        <Card className="h-fit">
          <CardContent className="space-y-4">
            <Heading level="h2" className="text-xl">
              Order Summary ({totalItems})
            </Heading>
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-sm">
                <span>
                  {item.name} ({item.unit}) × {item.quantity}
                </span>
                <span className="font-medium">₹{item.unitPrice * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>
            <Text className="text-sm text-text-muted">
              Shipping is free over ₹{FREE_SHIPPING_THRESHOLD}. Tax included where applicable.
            </Text>
          </CardContent>
        </Card>
      </div>
      <BackToTop />
    </Container>
  );
}
