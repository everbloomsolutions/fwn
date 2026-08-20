'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Container, Heading, Text, Button } from '@/shared/ui';
import { AdminBreadcrumbs } from '@/modules/admin/components/AdminBreadcrumbs';
import { Loader2, ArrowLeft, Package, Truck, CreditCard, MapPin, User, Phone, Mail } from 'lucide-react';

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
  paymentMethod: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryNotes?: string;
  trackingNumber?: string;
  courier?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderResponse {
  success: boolean;
  data: Order;
}

const STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'completed', 'failed', 'refunded'];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<OrderResponse>({
          method: 'GET',
          url: API_ENDPOINTS.orders.DETAIL(id),
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

  const update = async (data: Partial<Order>) => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await apiRequest<OrderResponse>({
        method: 'PATCH',
        url: `${API_ENDPOINTS.orders.LIST}/${order._id}`,
        data,
      });
      setOrder(res.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setSaving(false);
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

  const statusIndex = STATUSES.indexOf(order.status);

  return (
    <Container maxWidth="xl" className="py-6 sm:py-10">
      <AdminBreadcrumbs
        items={[
          { label: 'Orders', href: '/admin/orders' },
          { label: order.orderNumber },
        ]}
        className="mb-4"
      />
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Heading level="h1" size="compact" balance>
            {order.orderNumber}
          </Heading>
          <Text className="text-sm text-text-muted">
            Placed {new Date(order.createdAt).toLocaleString()} · Updated {new Date(order.updatedAt).toLocaleString()}
          </Text>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-bg px-2 py-1 font-medium uppercase tracking-wide">{order.status}</span>
          <span className="rounded-full bg-bg px-2 py-1 font-medium uppercase tracking-wide">{order.paymentStatus}</span>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
        <div className="relative mb-4">
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-border" />
          <div className="relative z-10 flex justify-between">
            {STATUSES.map((s, idx) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <span
                  className={
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ' +
                    (idx <= statusIndex ? 'bg-primary text-white' : 'bg-bg text-text-muted')
                  }
                >
                  {idx + 1}
                </span>
                <span className="hidden text-[10px] text-text-muted sm:inline">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <Heading level="h2" size="compact">
                Items
              </Heading>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div>
                    <Text className="font-medium">{item.name}</Text>
                    <Text className="text-sm text-text-muted">
                      {item.quantity} × {item.unit}
                    </Text>
                  </div>
                  <Text className="font-medium">₹{item.price * item.quantity}</Text>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4">
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
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <Heading level="h2" size="compact">
                Shipping Address
              </Heading>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-text-muted" />
                <Text>{order.shippingAddress.name}</Text>
              </div>
              {order.shippingAddress.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-text-muted" />
                  <Text>{order.shippingAddress.email}</Text>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-text-muted" />
                <Text>{order.shippingAddress.phone}</Text>
              </div>
              <div className="sm:col-span-2">
                <Text className="text-text-muted">
                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </Text>
              </div>
              {order.deliveryNotes && (
                <div className="sm:col-span-2">
                  <Text className="text-sm text-text-muted">Notes: {order.deliveryNotes}</Text>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <Heading level="h2" size="compact">
                Payment
              </Heading>
            </div>
            <Text className="mb-2 text-text-muted">Method: <span className="font-medium text-text">{order.paymentMethod}</span></Text>
            <Text className="mb-4 text-text-muted">Payment status: <span className="font-medium text-text">{order.paymentStatus}</span></Text>

            <label className="mb-1 block text-sm font-medium">Payment Status</label>
            <select
              value={order.paymentStatus}
              onChange={(e) => update({ paymentStatus: e.target.value as PaymentStatus })}
              disabled={saving}
              className="mb-4 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-sm font-medium">Order Status</label>
            <select
              value={order.status}
              onChange={(e) => update({ status: e.target.value as OrderStatus })}
              disabled={saving}
              className="mb-4 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <Button size="sm" onClick={() => update({ status: 'cancelled' })} disabled={saving || order.status === 'cancelled'}>
              Cancel order
            </Button>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <Heading level="h2" size="compact">
                Shipment
              </Heading>
            </div>
            <label className="mb-1 block text-sm font-medium">Courier</label>
            <input
              type="text"
              value={order.courier || ''}
              onChange={(e) => setOrder((o) => (o ? { ...o, courier: e.target.value } : null))}
              className="mb-3 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              placeholder="e.g. Delhivery"
            />
            <label className="mb-1 block text-sm font-medium">Tracking number</label>
            <input
              type="text"
              value={order.trackingNumber || ''}
              onChange={(e) => setOrder((o) => (o ? { ...o, trackingNumber: e.target.value } : null))}
              className="mb-4 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              placeholder="e.g. 1234567890"
            />
            <Button size="sm" onClick={() => update({ courier: order.courier, trackingNumber: order.trackingNumber })} disabled={saving}>
              Save tracking
            </Button>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <Link
              href={`/admin/orders/${order._id}/invoice`}
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              View / print invoice →
            </Link>
          </section>
        </div>
      </div>
    </Container>
  );
}
