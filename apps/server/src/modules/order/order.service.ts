import { Order, IOrder, IOrderItem } from './order.model';
import { Product } from '../product/product.model';
import mongoose from 'mongoose';

export interface CreateOrderData {
  userId?: string;
  items: IOrderItem[];
  shippingAddress: IOrder['shippingAddress'];
}

export const generateOrderNumber = (): string => {
  const prefix = 'FWN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

export const createOrder = async (data: CreateOrderData): Promise<IOrder> => {
  let subtotal = 0;

  for (const item of data.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    product.stock -= item.quantity;
    await product.save();

    subtotal += item.price * item.quantity;
  }

  const shipping = 0; // Shipping/tax deferred
  const tax = 0;
  const total = subtotal + shipping + tax;

  const order = new Order({
    userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
    orderNumber: generateOrderNumber(),
    items: data.items,
    subtotal,
    shipping,
    tax,
    total,
    shippingAddress: data.shippingAddress,
  });

  return await order.save();
};

export const getOrders = async (userId?: string, isAdmin = false): Promise<IOrder[]> => {
  const query: Record<string, unknown> = {};
  if (!isAdmin && userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  return await Order.find(query).sort({ createdAt: -1 }).exec();
};

export const getOrderById = async (id: string): Promise<IOrder | null> => {
  return await Order.findById(id).exec();
};

export const updateOrderStatus = async (
  id: string,
  data: { status?: IOrder['status']; paymentStatus?: IOrder['paymentStatus'] }
): Promise<IOrder | null> => {
  return await Order.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
};
