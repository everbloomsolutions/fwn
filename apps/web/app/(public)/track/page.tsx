'use client';

import { useState } from 'react';
import { Container, Heading, Text, Card, CardContent, BackToTop } from '@/shared/ui';
import { API_ENDPOINTS } from '@/shared/config/api';
import { apiRequest } from '@/shared/core/http/apiClient';
import { Search, Package, CheckCircle2, Truck, Home, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface OrderItem {
  name: string;
  unit: string;
  quantity: number;
  price: number;
}

interface Order {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  estimatedDelivery?: string;
  createdAt: string;
}

interface TrackResponse {
  success: boolean;
  data: Order;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'paid', label: 'Paid', icon: CheckCircle2 },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const response = await apiRequest<TrackResponse>({
        method: 'GET',
        url: API_ENDPOINTS.orders.TRACK,
        params: { orderNumber, phone },
      });
      setOrder(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const activeIndex = statusSteps.findIndex((s) => s.key === (order?.status === 'cancelled' ? 'pending' : order?.status));

  return (
    <Container maxWidth="xl" className="py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Heading level="h1" className="mb-4">
          Track Your Order
        </Heading>
        <Text className="text-text-muted">Enter your order number and phone to track your order.</Text>
      </div>

      <Card className="mx-auto mt-8 max-w-xl">
        <CardContent>
          <form onSubmit={track} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Order Number</label>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                placeholder="FWN-..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary"
                placeholder="9876543210"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? <Clock className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track Order
            </button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="mx-auto mt-8 max-w-xl rounded-xl border border-error/30 bg-error/10 p-4 text-center text-error">
          <AlertCircle className="mx-auto mb-2 h-5 w-5" />
          {error}
        </div>
      )}

      {order && (
        <Card className="mx-auto mt-8 max-w-2xl">
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Heading level="h2" className="text-xl">
                  Order {order.orderNumber}
                </Heading>
                <Text className="text-sm text-text-muted">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </Text>
              </div>
              <span
                className={cn(
                  'w-fit rounded-full px-3 py-1 text-xs font-medium uppercase',
                  order.status === 'delivered'
                    ? 'bg-success/10 text-success'
                    : order.status === 'cancelled'
                    ? 'bg-error/10 text-error'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {order.status}
              </span>
            </div>

            {order.status !== 'cancelled' && (
              <div className="flex items-start justify-between gap-2">
                {statusSteps.map((s, idx) => {
                  const Icon = s.icon;
                  const completed = idx <= activeIndex;
                  return (
                    <div key={s.key} className="flex flex-1 flex-col items-center gap-2 text-center">
                      <div
                        className={cn(
                          'rounded-full p-2',
                          completed ? 'bg-primary text-white' : 'bg-surface text-text-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={cn('text-xs', completed ? 'font-medium text-text' : 'text-text-muted')}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 rounded-xl border border-border p-4">
              <Heading level="h3" className="text-base">
                Items
              </Heading>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.name} ({item.unit}) × {item.quantity}
                  </span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <Heading level="h3" className="text-base">
                  Shipping Address
                </Heading>
                <Text className="mt-1 text-sm text-text-muted">
                  {order.shippingAddress.name}
                  <br />
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  <br />
                  Phone: {order.shippingAddress.phone}
                </Text>
              </div>
              <div className="rounded-xl border border-border p-4">
                <Heading level="h3" className="text-base">
                  Payment
                </Heading>
                <Text className="mt-1 text-sm capitalize text-text-muted">
                  {order.paymentMethod}
                  <br />
                  Status: {order.paymentStatus}
                </Text>
                {order.estimatedDelivery && (
                  <Text className="mt-2 text-sm text-primary">
                    Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}
                  </Text>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <BackToTop />
    </Container>
  );
}
