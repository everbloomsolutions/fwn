import { Request, Response, NextFunction } from 'express';
import * as orderService from './order.service';
import { AppError } from '../../core/exceptions/errorHandler';

interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const order = await orderService.createOrder({
      userId,
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
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
    const orderUserId = order.userId?.toString();

    if (!isAdmin && userId !== orderUserId) {
      throw new AppError('Not authorized to view this order', 403);
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
