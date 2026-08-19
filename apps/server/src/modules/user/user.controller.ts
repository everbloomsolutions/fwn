import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import { AppError } from '../../core/exceptions/errorHandler';

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not found in request', 401);
    }

    const { name, email } = req.body;
    const user = await userService.updateProfile(req.user._id.toString(), {
      name,
      email,
    });

    res.status(200).json({
      success: true,
      data: { user },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not found in request', 401);
    }

    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.user._id.toString(), {
      currentPassword,
      newPassword,
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateOnboardingProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not found in request', 401);
    }

    const { name, phoneNumber, company, preferences } = req.body;
    const user = await userService.updateOnboardingProfile(req.user._id.toString(), {
      name,
      phoneNumber,
      company,
      preferences,
    });

    res.status(200).json({
      success: true,
      data: { user },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const completeOnboarding = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not found in request', 401);
    }

    await userService.completeOnboarding(req.user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getOnboardingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('User not found in request', 401);
    }

    const status = await userService.getOnboardingStatus(req.user._id.toString());

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const userController = {
  updateProfile,
  changePassword,
  updateOnboardingProfile,
  completeOnboarding,
  getOnboardingStatus,
};

