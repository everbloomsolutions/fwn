'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Heading, Text } from '@/shared/ui';
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

const STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'completed', 'failed', 'refunded'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  async function loadOrders() {
    try {
      setLoading(true);
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

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrder = async (id: string, data: { status?: OrderStatus; paymentStatus?: PaymentStatus }) => {
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      await apiRequest({
        method: 'PATCH',
        url: `${API_ENDPOINTS.orders.LIST}/${id}`,
        data,
      });
      await loadOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

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
        Order Management
      </Heading>

      {orders.length === 0 ? (
        <Text className="text-text-muted">No orders found.</Text>
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
                    {new Date(order.createdAt).toLocaleDateString()} · {order.shippingAddress.name} · ₹{order.total}
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

              <details className="mb-4 group">
                <summary className="cursor-pointer text-sm font-medium text-primary">
                  View items & address
                </summary>
                <div className="mt-3 space-y-3 text-sm text-text-muted">
                  <div>
                    <span className="font-medium text-text">Items:</span>
                    <ul className="mt-1 list-inside list-disc">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity} × {item.name} ({item.unit}) — ₹{item.price * item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium text-text">Shipping address:</span>
                    <p>{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>
                      {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                  </div>
                </div>
              </details>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">Order Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrder(order._id, { status: e.target.value as OrderStatus })}
                    disabled={updating[order._id]}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">Payment Status</label>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => updateOrder(order._id, { paymentStatus: e.target.value as PaymentStatus })}
                    disabled={updating[order._id]}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                  >
                    {PAYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
