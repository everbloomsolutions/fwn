'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Container, Heading, Text, Button } from '@/shared/ui';
import { Loader2, ArrowLeft } from 'lucide-react';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

interface OrderItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  items: OrderItem[];
  paymentMethod: string;
  shippingAddress: { name: string; phone: string; email?: string; address: string; city: string; state: string; pincode: string };
  deliveryNotes?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  courier?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderResponse {
  success: boolean;
  data: Order;
}

const statusSteps: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'paid', label: 'Payment Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<OrderResponse>({
          method: 'GET',
          url: `${API_ENDPOINTS.orders.LIST}/${id}`,
        });
        setOrder(res.data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const cancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await apiRequest({
        method: 'PATCH',
        url: `${API_ENDPOINTS.orders.LIST}/${order._id}`,
        data: { status: 'cancelled' },
      });
      router.refresh();
      const res = await apiRequest<OrderResponse>({
        method: 'GET',
        url: `${API_ENDPOINTS.orders.LIST}/${id}`,
      });
      setOrder(res.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Text className="text-error">Order not found</Text>
      </Container>
    );
  }

  const activeStep = statusSteps.findIndex((s) => s.key === (order.status === 'cancelled' ? 'pending' : order.status));

  return (
    <Container maxWidth="xl" className="py-6 sm:py-12">
      <Link
        href="/profile/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Heading level="h1" size="compact" balance>
          Order {order.orderNumber}
        </Heading>
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <Button size="sm" variant="secondary" onClick={cancelOrder} disabled={cancelling}>
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        )}
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-bg px-2 py-1 font-medium uppercase tracking-wide">{order.status}</span>
          <span className="rounded-full bg-bg px-2 py-1 font-medium uppercase tracking-wide">{order.paymentStatus}</span>
        </div>

        <div className="relative mb-6">
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-border" />
          <div className="relative z-10 flex justify-between">
            {statusSteps.map((step, idx) => (
              <div key={step.key} className="flex flex-col items-center gap-1">
                <span
                  className={
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ' +
                    (idx <= activeStep ? 'bg-primary text-white' : 'bg-bg text-text-muted')
                  }
                >
                  {idx + 1}
                </span>
                <span className="hidden text-[10px] text-text-muted sm:inline">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Text className="text-text-muted">Placed on {new Date(order.createdAt).toLocaleString()}</Text>
        {order.estimatedDelivery && order.status !== 'cancelled' && (
          <Text className="text-text-muted">
            Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
          </Text>
        )}
        {order.trackingNumber && (
          <Text className="text-text-muted">
            Courier: {order.courier || 'N/A'} · Tracking: {order.trackingNumber}
          </Text>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Heading level="h2" size="compact" className="mb-4">
            Items
          </Heading>
          <div className="rounded-2xl border border-border bg-surface">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-border p-4 last:border-0"
              >
                <div>
                  <Text className="font-medium">{item.name}</Text>
                  <Text className="text-sm text-text-muted">
                    {item.quantity} × {item.unit}
                  </Text>
                </div>
                <Text className="font-medium">₹{item.price * item.quantity}</Text>
              </div>
            ))}
            <div className="border-t border-border p-4">
              <div className="flex justify-between text-sm text-text-muted">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-text-muted">
                <span>Shipping</span>
                <span>₹{order.shipping}</span>
              </div>
              <div className="flex justify-between text-sm text-text-muted">
                <span>Tax</span>
                <span>₹{order.tax}</span>
              </div>
              <div className="mt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Heading level="h2" size="compact" className="mb-4">
            Shipping Address
          </Heading>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <Text className="font-medium">{order.shippingAddress.name}</Text>
            {order.shippingAddress.email && (
              <Text className="text-sm text-text-muted">{order.shippingAddress.email}</Text>
            )}
            <Text className="text-sm text-text-muted">{order.shippingAddress.phone}</Text>
            <Text className="mt-2 text-sm text-text-muted">
              {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </Text>
            {order.deliveryNotes && (
              <Text className="mt-2 text-sm text-text-muted">Notes: {order.deliveryNotes}</Text>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
