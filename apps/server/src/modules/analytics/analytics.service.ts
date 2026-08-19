import { AnalyticsEvent, IAnalyticsEvent } from './analytics.model';
import mongoose from 'mongoose';

export interface CreateAnalyticsEventData {
  eventType: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AnalyticsQuery {
  page?: number;
  limit?: number;
  eventType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const createAnalyticsEvent = async (
  data: CreateAnalyticsEventData
): Promise<IAnalyticsEvent> => {
  const event = new AnalyticsEvent({
    eventType: data.eventType,
    userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
    sessionId: data.sessionId,
    properties: data.properties || {},
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  });

  await event.save();
  return event;
};

export const getAnalyticsEvents = async (query: AnalyticsQuery): Promise<{
  events: IAnalyticsEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const {
    page = 1,
    limit = 10,
    eventType,
    userId,
    startDate,
    endDate,
  } = query;

  const filter: Record<string, unknown> = {};

  if (eventType) {
    filter.eventType = eventType;
  }

  if (userId) {
    filter.userId = new mongoose.Types.ObjectId(userId);
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
    }
    if (endDate) {
      (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
    }
  }

  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    AnalyticsEvent.find(filter)
      .populate('userId', 'email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    AnalyticsEvent.countDocuments(filter),
  ]);

  return {
    events,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getEventStats = async (
  eventType: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number;
  uniqueUsers: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}> => {
  const filter: Record<string, unknown> = {
    eventType,
  };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      (filter.createdAt as Record<string, unknown>).$gte = startDate;
    }
    if (endDate) {
      (filter.createdAt as Record<string, unknown>).$lte = endDate;
    }
  }

  const [total, uniqueUsers] = await Promise.all([
    AnalyticsEvent.countDocuments(filter),
    AnalyticsEvent.distinct('userId', filter).then((userIds) => userIds.length),
  ]);

  return {
    total,
    uniqueUsers,
    dateRange: {
      start: startDate || new Date(0),
      end: endDate || new Date(),
    },
  };
};

export const analyticsService = {
  createAnalyticsEvent,
  getAnalyticsEvents,
  getEventStats,
};

