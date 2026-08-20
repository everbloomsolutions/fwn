'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Text } from '@/shared/ui';
import { PageHeader } from '@/shared/ui/layout';
import { useApi, useDebounce } from '@/shared/hooks';
import { Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'completed', 'failed', 'refunded'];

function buildOrdersUrl(page: number, search: string, status: OrderStatus | '', paymentStatus: PaymentStatus | ''): string {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', '20');
  if (search.trim()) params.set('search', search.trim());
  if (status) params.set('status', status);
  if (paymentStatus) params.set('paymentStatus', paymentStatus);
  return `${API_ENDPOINTS.orders.LIST}?${params.toString()}`;
}

export default function AdminOrdersPage() {
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, status, paymentStatus]);

  const debouncedSearch = useDebounce(search, 300);
  const ordersUrl = buildOrdersUrl(page, debouncedSearch, status, paymentStatus);

  const { data, isLoading, mutate } = useApi<OrdersResponse>(ordersUrl);
  const orders = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const updateOrder = async (id: string, data: { status?: OrderStatus; paymentStatus?: PaymentStatus }) => {
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      await apiRequest({
        method: 'PATCH',
        url: `${API_ENDPOINTS.orders.LIST}/${id}`,
        data,
      });
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div>
      <div className="sticky top-20 z-30 -mx-4 mb-6 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:py-4">
        <PageHeader title="Order Management" />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search order #, name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-4 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | '')}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
          >
            <option value="">All payments</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <Text className="text-text-muted">No orders found.</Text>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-2xl border border-border bg-surface p-4 sm:p-6"
              >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="text-base font-semibold text-text hover:text-primary"
                    >
                      {order.orderNumber}
                    </Link>
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

                <div className="mb-4 text-sm text-text-muted">
                  {order.items.map((item) => `${item.quantity} × ${item.name} (${item.unit})`).join(', ')}
                </div>

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

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <Text className="text-sm text-text-muted">
                {pagination.total} orders - page {pagination.page} of {pagination.totalPages}
              </Text>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-hover disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-text-muted">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="inline-flex items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-hover disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
