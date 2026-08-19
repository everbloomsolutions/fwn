import { Request, Response, NextFunction } from 'express';
import * as orderService from './order.service';
import { AppError } from '../../core/exceptions/errorHandler';

interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

function getGuestId(req: Request): string | undefined {
  const guestId = req.headers['x-guest-id'];
  return typeof guestId === 'string' && guestId ? guestId : undefined;
}

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const guestId = !userId ? getGuestId(req) : undefined;
    const order = await orderService.createOrder({
      userId,
      guestId,
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      deliveryNotes: req.body.deliveryNotes,
    });
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?._id?.toString();
    if (!userId && !isAdmin) {
      throw new AppError('Authentication required', 401);
    }
    const orders = await orderService.getOrders(userId, isAdmin);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?._id?.toString();
    if (!userId && !isAdmin) {
      throw new AppError('Authentication required', 401);
    }
    const orderUserId = order.userId?.toString();

    if (!isAdmin && userId !== orderUserId) {
      throw new AppError('Not authorized to view this order', 403);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const trackOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderNumber, phone } = req.query as { orderNumber?: string; phone?: string };
    if (!orderNumber || !phone) {
      throw new AppError('orderNumber and phone are required', 400);
    }
    const order = await orderService.getOrderByNumberAndPhone(orderNumber, phone);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    res.status(200).json({ success: true, data: order, message: 'Order updated' });
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderNumber, razorpayPaymentId, razorpayOrderId, status } = req.body as {
      orderNumber: string;
      razorpayPaymentId: string;
      razorpayOrderId: string;
      status: string;
    };
    const order = await orderService.getOrderByNumber(orderNumber);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
      throw new AppError('Payment mismatch', 400);
    }
    const paymentStatus = status === 'success' ? 'completed' : 'failed';
    const orderStatus = status === 'success' ? 'paid' : order.status;
    const updated = await orderService.updateOrderStatus(order._id.toString(), { status: orderStatus, paymentStatus });
    if (updated) {
      updated.razorpayPaymentId = razorpayPaymentId;
      await updated.save();
    }
    res.status(200).json({ success: true, data: updated, message: 'Payment updated' });
  } catch (error) {
    next(error);
  }
};
