import { Notification, INotification } from './notification.model';
import { AppError } from '../../core/exceptions/errorHandler';
import mongoose from 'mongoose';

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'inquiry';
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error' | 'inquiry';
}

export const createNotification = async (
  data: CreateNotificationData
): Promise<INotification> => {
  const notification = new Notification({
    user: data.userId,
    title: data.title,
    message: data.message,
    type: data.type || 'info',
    link: data.link,
    metadata: data.metadata || {},
  });

  await notification.save();
  return notification;
};

export const createBatchNotifications = async (
  notifications: CreateNotificationData[]
): Promise<INotification[]> => {
  const notificationDocs = notifications.map((data) => ({
    user: new mongoose.Types.ObjectId(data.userId),
    title: data.title,
    message: data.message,
    type: data.type || 'info',
    link: data.link,
    metadata: data.metadata || {},
  }));

  const created = await Notification.insertMany(notificationDocs);
  return created;
};

export const getNotificationById = async (notificationId: string): Promise<INotification> => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notification;
};

export const getUserNotifications = async (
  userId: string,
  query: NotificationQuery
): Promise<{
  notifications: INotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const { page = 1, limit = 10, isRead, type } = query;

  const filter: Record<string, unknown> = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (isRead !== undefined) {
    filter.isRead = isRead;
  }

  if (type) {
    filter.type = type;
  }

  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: new mongoose.Types.ObjectId(userId), isRead: false }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const markAsRead = async (
  notificationId: string,
  userId: string
): Promise<INotification> => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.user.toString() !== userId) {
    throw new AppError('You do not have permission to update this notification', 403);
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  await Notification.updateMany(
    { user: new mongoose.Types.ObjectId(userId), isRead: false },
    { isRead: true }
  );
};

export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.user.toString() !== userId) {
    throw new AppError('You do not have permission to delete this notification', 403);
  }

  await Notification.findByIdAndDelete(notificationId);
};

export const notificationService = {
  createNotification,
  createBatchNotifications,
  getNotificationById,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

