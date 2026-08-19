import { Request, Response, NextFunction } from 'express';
import * as notificationService from './notification.service';
import { AppError } from '../../core/exceptions/errorHandler';

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not found in request', 401);
    }

    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      type: req.query.type as 'info' | 'success' | 'warning' | 'error' | 'inquiry' | undefined,
    };

    const result = await notificationService.getUserNotifications(
      req.user._id.toString(),
      query
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not found in request', 401);
    }

    const { id } = req.params;
    const notification = await notificationService.markAsRead(
      id,
      req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      data: { notification },
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not found in request', 401);
    }

    await notificationService.markAllAsRead(req.user._id.toString());

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not found in request', 401);
    }

    const { id } = req.params;
    await notificationService.deleteNotification(id, req.user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const notificationController = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

