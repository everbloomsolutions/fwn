import { Order, IOrder, IOrderItem } from './order.model';
import { Product } from '../product/product.model';
import { User } from '../user/user.model';
import { assignCartToUser } from '../cart/cart.service';
import { updateTopBestSellers } from '../product/product.service';
import { OrderStatusLog } from './order-status-log.model';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import { logger } from '../../core/middleware/logger';

export interface CreateOrderData {
  userId?: string;
  guestId?: string;
  items: IOrderItem[];
  shippingAddress: IOrder['shippingAddress'];
  paymentMethod: IOrder['paymentMethod'];
  deliveryNotes?: string;
}

export const generateOrderNumber = (): string => {
  const prefix = 'FWN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

async function createRazorpayOrder(total: number, orderNumber: string): Promise<string | undefined> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    logger.info('Razorpay not configured; skipping payment order creation');
    return undefined;
  }

  try {
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rzp.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: orderNumber,
      notes: { orderNumber },
    });
    return order.id;
  } catch (error) {
    logger.warn('Razorpay order creation failed:', error);
    return undefined;
  }
}

async function findOrCreateGuestUser(shippingAddress: IOrder['shippingAddress']): Promise<mongoose.Types.ObjectId | undefined> {
  if (!shippingAddress.email) {
    throw new Error('Email is required for guest checkout');
  }

  let user = await User.findOne({ email: shippingAddress.email }).exec();
  if (user) {
    return user._id as mongoose.Types.ObjectId;
  }

  const baseEmail = shippingAddress.email.replace(/@/, `+guest@`);
  user = new User({
    email: baseEmail.includes('+guest@') ? baseEmail : `guest-${Date.now()}@foodworldnaturals.com`,
    name: shippingAddress.name,
    phoneNumber: shippingAddress.phone,
    role: 'guest',
    isGuest: true,
    isActive: true,
    onboardingCompleted: true,
  });
  await user.save();
  return user._id as mongoose.Types.ObjectId;
}

export const createOrder = async (data: CreateOrderData): Promise<IOrder> => {
  let subtotal = 0;
  const populatedItems: IOrderItem[] = [];
  const isCod = data.paymentMethod === 'cod';

  for (const item of data.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }

    let price = item.price;
    let unit = item.unit;
    let variantId = item.variant;

    if (variantId) {
      const variant = product.variants.find((v) => v._id.toString() === variantId?.toString());
      if (variant) {
        price = variant.price;
        unit = variant.unit;
        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name} - ${variant.unit}`);
        }
        if (isCod) {
          variant.stock -= item.quantity;
        }
      } else {
        throw new Error(`Variant not found for ${product.name}`);
      }
    } else {
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      if (isCod) {
        product.stock -= item.quantity;
      }
    }

    if (isCod) {
      await product.save();
    }

    populatedItems.push({
      product: product._id as mongoose.Types.ObjectId,
      variant: variantId,
      name: product.name,
      price,
      quantity: item.quantity,
      unit,
    });

    subtotal += price * item.quantity;
  }

  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;
  const orderNumber = generateOrderNumber();

  let razorpayOrderId: string | undefined;
  if (data.paymentMethod === 'razorpay' || data.paymentMethod === 'upi') {
    razorpayOrderId = await createRazorpayOrder(total, orderNumber);
  }

  let userId: mongoose.Types.ObjectId | undefined;
  if (data.userId) {
    userId = new mongoose.Types.ObjectId(data.userId);
  } else if (data.guestId) {
    userId = await findOrCreateGuestUser(data.shippingAddress);
    if (userId && data.guestId) {
      await assignCartToUser(data.guestId, userId.toString());
    }
  }

  const order = new Order({
    userId,
    orderNumber,
    items: populatedItems,
    subtotal,
    shipping,
    tax,
    total,
    paymentMethod: data.paymentMethod,
    stockDeducted: isCod,
    shippingAddress: data.shippingAddress,
    deliveryNotes: data.deliveryNotes,
    razorpayOrderId,
    status: 'pending',
    paymentStatus: 'pending',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
  });

  const savedOrder = await order.save();

  // Update sales counts and best-seller flags only for confirmed (COD) orders
  if (isCod) {
    await Promise.all(
      populatedItems.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { salesCount: item.quantity } })
      )
    );
    updateTopBestSellers().catch((err) => logger.warn('Failed to update best sellers:', err));
  }

  return savedOrder;
};

export interface GetOrdersFilters {
  status?: IOrder['status'];
  paymentStatus?: IOrder['paymentStatus'];
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrders {
  orders: IOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getOrders = async (
  userId?: string,
  isAdmin = false,
  filters: GetOrdersFilters = {}
): Promise<PaginatedOrders> => {
  const query: Record<string, unknown> = {};
  if (!isAdmin && userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) (query.createdAt as Record<string, Date>).$gte = filters.startDate;
    if (filters.endDate) (query.createdAt as Record<string, Date>).$lte = filters.endDate;
  }
  if (filters.search) {
    const re = new RegExp(filters.search, 'i');
    query.$or = [
      { orderNumber: re },
      { 'shippingAddress.name': re },
      { 'shippingAddress.phone': re },
    ];
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(filters.limit && filters.limit > 0 ? filters.limit : 20, 100);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
    Order.countDocuments(query).exec(),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getOrderById = async (id: string): Promise<IOrder | null> => {
  return await Order.findById(id).exec();
};

export const getOrderByNumber = async (orderNumber: string): Promise<IOrder | null> => {
  return await Order.findOne({ orderNumber }).exec();
};

export const getOrderByNumberAndPhone = async (orderNumber: string, phone: string): Promise<IOrder | null> => {
  return await Order.findOne({ orderNumber, 'shippingAddress.phone': phone }).exec();
};

const validOrderStatusTransitions: Record<IOrder['status'], IOrder['status'][]> = {
  pending: ['paid', 'shipped', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const updateOrderStatus = async (
  id: string,
  data: {
    status?: IOrder['status'];
    paymentStatus?: IOrder['paymentStatus'];
    trackingNumber?: string;
    courier?: string;
  }
): Promise<IOrder | null> => {
  const existing = await Order.findById(id).exec();
  if (!existing) return null;

  if (data.status && data.status !== existing.status) {
    const allowed = validOrderStatusTransitions[existing.status] || [];
    if (!allowed.includes(data.status)) {
      throw new Error(`Cannot change order status from ${existing.status} to ${data.status}`);
    }
  }

  const order = await Order.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  if (!order) return null;

  // Deduct stock when an online order is paid
  if (data.status === 'paid' && !order.stockDeducted) {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      const variant = product.variants.find((v) => v._id.toString() === item.variant?.toString());
      if (variant) {
        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name} - ${variant.unit}`);
        }
        variant.stock -= item.quantity;
      } else {
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        product.stock -= item.quantity;
      }
      product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
      product.salesCount = (product.salesCount || 0) + item.quantity;
      await product.save();
    }
    order.stockDeducted = true;
    await order.save();
    updateTopBestSellers().catch((err) => logger.warn('Failed to update best sellers:', err));
  }

  // Restore stock and sales count when an order is cancelled
  if (data.status === 'cancelled' && order.stockDeducted) {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      const variant = product.variants.find((v) => v._id.toString() === item.variant?.toString());
      if (variant) {
        variant.stock += item.quantity;
      } else {
        product.stock += item.quantity;
      }
      product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
      product.salesCount = Math.max(0, (product.salesCount || 0) - item.quantity);
      await product.save();
    }
    order.stockDeducted = false;
    await order.save();
    updateTopBestSellers().catch((err) => logger.warn('Failed to update best sellers:', err));
  }

  await OrderStatusLog.create({
    orderId: order._id,
    status: order.status,
    paymentStatus: order.paymentStatus,
  });

  return order;
};

export const bulkUpdateOrderStatus = async (
  ids: string[],
  data: { status?: IOrder['status']; paymentStatus?: IOrder['paymentStatus'] }
): Promise<void> => {
  for (const id of ids) {
    await updateOrderStatus(id, data);
  }
};
