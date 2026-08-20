'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '@/shared/core/http/apiClient';
import { API_ENDPOINTS } from '@/shared/config/api';
import { Container, Heading, Text } from '@/shared/ui';
import { AdminBreadcrumbs } from '@/modules/admin/components/AdminBreadcrumbs';

interface Order {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  items: { name: string; quantity: number; unit: string; price: number }[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
}

interface OrderResponse {
  success: boolean;
  data: Order;
}

export default function AdminOrderInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    apiRequest<OrderResponse>({ method: 'GET', url: API_ENDPOINTS.orders.DETAIL(id) }).then((res) =>
      setOrder(res.data)
    );
  }, [id]);

  if (!order) {
    return (
      <Container maxWidth="xl" className="py-16 text-center">
        <Text>Loading invoice...</Text>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8">
      <AdminBreadcrumbs
        items={[
          { label: 'Orders', href: '/admin/orders' },
          { label: order.orderNumber, href: `/admin/orders/${order.orderNumber}` },
          { label: 'Invoice' },
        ]}
        className="mb-4"
      />
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-8 shadow-sm print:shadow-none print:border-none">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Heading level="h1" size="compact" balance className="text-2xl">
              Foodworld Naturals
            </Heading>
            <Text className="text-sm text-text-muted">
              202, Grecious Homes, Lane Number 1, Mythri Nagar,
              <br />
              Madeenaguda, Hyderabad 500049
            </Text>
          </div>
          <div className="text-left sm:text-right">
            <Text className="text-sm font-medium">Invoice for</Text>
            <Text className="text-xl font-bold text-primary">{order.orderNumber}</Text>
            <Text className="text-sm text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</Text>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <Text className="text-sm font-medium">Bill to</Text>
            <Text className="font-medium">{order.shippingAddress.name}</Text>
            <Text className="text-sm text-text-muted">{order.shippingAddress.phone}</Text>
            <Text className="text-sm text-text-muted">
              {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </Text>
          </div>
          <div>
            <Text className="text-sm font-medium">Payment</Text>
            <Text className="text-sm text-text-muted">Method: {order.paymentMethod}</Text>
            <Text className="text-sm text-text-muted">Status: {order.paymentStatus}</Text>
            <Text className="text-sm text-text-muted">Order status: {order.status}</Text>
          </div>
        </div>

        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-muted">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Price</th>
              <th className="pb-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-b border-border/50">
                <td className="py-2">{item.name} ({item.unit})</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2 text-right">₹{item.price}</td>
                <td className="py-2 text-right">₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 border-t border-border pt-4 text-right">
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
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-text-muted">
          Thank you for shopping with Foodworld Naturals!
        </div>
      </div>
    </Container>
  );
}
