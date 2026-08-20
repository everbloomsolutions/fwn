'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Heading, Text, Button } from '@/shared/ui';
import { Loader2 } from 'lucide-react';

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
  items: OrderItem[];
  shippingAddress: { name: string; phone: string; address: string; city: string; state: string; pincode: string };
  createdAt: string;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<OrdersResponse>({
          method: 'GET',
          url: API_ENDPOINTS.orders.LIST,
        });
        setOrders(res.data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <Heading level="h2" size="compact" balance className="mb-6">
        My Orders
      </Heading>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <Text className="text-text-muted">You have not placed any orders yet.</Text>
          <Link href="/shop" className="mt-4 inline-block">
            <Button size="sm">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-border bg-surface p-4 sm:p-6"
            >
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Heading level="h3" className="text-base">
                    {order.orderNumber}
                  </Heading>
                  <Text className="text-sm text-text-muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-bg px-2 py-1 font-medium uppercase tracking-wide">
                    {order.status}
                  </span>
                  <span className="rounded-full bg-bg px-2 py-1 font-medium uppercase tracking-wide">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="text-sm text-text-muted">
                {order.items.map((item) => `${item.quantity} × ${item.name} (${item.unit})`).join(', ')}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <Text className="font-medium">Total: ₹{order.total}</Text>
                <Link
                  href={`/profile/orders/${order._id}`}
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  View details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
