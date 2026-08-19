import { Request, Response, NextFunction } from 'express';
import * as cartService from './cart.service';
import { AppError } from '../../core/exceptions/errorHandler';

interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

function getGuestId(req: Request): string | undefined {
  const guestId = req.headers['x-guest-id'];
  if (typeof guestId === 'string' && guestId) {
    return guestId;
  }
  return undefined;
}

export const getCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const guestId = getGuestId(req);
    if (!userId && !guestId) {
      throw new AppError('Guest or user identification required', 400);
    }
    const cart = await cartService.getOrCreateCart(userId, guestId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const guestId = getGuestId(req);
    if (!userId && !guestId) {
      throw new AppError('Guest or user identification required', 400);
    }
    const cart = await cartService.addItemToCart(req.body, userId, guestId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const guestId = getGuestId(req);
    if (!userId && !guestId) {
      throw new AppError('Guest or user identification required', 400);
    }
    const cart = await cartService.updateItemQuantity(req.params.variantId, req.body.quantity, userId, guestId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const guestId = getGuestId(req);
    if (!userId && !guestId) {
      throw new AppError('Guest or user identification required', 400);
    }
    const cart = await cartService.removeItemFromCart(req.params.variantId, userId, guestId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const clearCartItems = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const guestId = getGuestId(req);
    if (!userId && !guestId) {
      throw new AppError('Guest or user identification required', 400);
    }
    await cartService.clearCart(userId, guestId);
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};
