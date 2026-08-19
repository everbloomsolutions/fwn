import { Request, Response, NextFunction } from 'express';
import * as analyticsService from './analytics.service';

export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventType, properties, sessionId } = req.body;

    const event = await analyticsService.createAnalyticsEvent({
      eventType,
      userId: req.user?._id.toString(),
      sessionId,
      properties,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      data: { event },
      message: 'Analytics event created',
    });
  } catch (error) {
    next(error);
  }
};

export const analyticsController = {
  createEvent,
};

