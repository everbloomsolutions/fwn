import { User, IUserResponse, toUserResponse } from '../user/user.model';
import { AppError } from '../../core/exceptions/errorHandler';
import { generateToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../../core/utils/jwt';
import { TokenBlacklist } from './token-blacklist.model';
import { PasswordResetToken } from './password-reset-token.model';
import { logger } from '../../core/middleware/logger';
import { emailService } from '../../core/utils/emailService';
import { config } from '../../core/config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: IUserResponse;
  token: string;
  refreshToken?: string;
  isNewUser?: boolean;
}

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  const user = new User({
    email: data.email.toLowerCase(),
    password: data.password,
    name: data.name,
  });

  await user.save();

  const tokenPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: toUserResponse(user),
    token,
    refreshToken,
    isNewUser: true,
  };
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('User account is inactive', 403);
  }

  const isPasswordValid = await user.comparePassword(data.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokenPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: toUserResponse(user),
    token,
    refreshToken,
    isNewUser: false,
  };
};

export const getCurrentUser = async (userId: string): Promise<IUserResponse> => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isActive) {
    throw new AppError('User account is inactive', 403);
  }

  return toUserResponse(user);
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> => {
  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }
};

export const blacklistToken = async (token: string): Promise<void> => {
  try {
    // Decode token to get expiration
    const decoded = jwt.decode(token) as jwt.JwtPayload | null;
    
    if (!decoded || !decoded.exp) {
      // If token can't be decoded or has no expiration, set a default expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days default
      
      await TokenBlacklist.create({
        token,
        expiresAt,
      });
      return;
    }

    // Set expiration based on token expiration
    const expiresAt = new Date(decoded.exp * 1000);

    await TokenBlacklist.create({
      token,
      expiresAt,
    });
  } catch (error) {
    // Don't throw - token blacklisting should not break the logout flow
    logger.error('Error blacklisting token:', error);
  }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    return blacklistedToken !== null;
  } catch (error) {
    logger.error('Error checking token blacklist:', error);
    return false;
  }
};

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

/**
 * Request password reset - sends email with reset link
 */
export const forgotPassword = async (data: ForgotPasswordData): Promise<void> => {
  const user = await User.findOne({ email: data.email.toLowerCase() });
  
  // Don't reveal if user exists (security best practice)
  if (!user) {
    // Still return success to prevent email enumeration
    return;
  }

  // Check if user has OAuth (can't reset password)
  if (user.oauthProvider) {
    // Still return success to prevent revealing OAuth status
    return;
  }

  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

  // Save reset token
  await PasswordResetToken.create({
    userId: user._id,
    token: resetToken,
    expiresAt,
    used: false,
  });

  // Generate reset URL
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  // Send password reset email
  await emailService.sendPasswordResetEmail(user, resetUrl);

  logger.info('Password reset email sent', { userId: user._id.toString() });
};

/**
 * Reset password using token
 */
export const resetPassword = async (data: ResetPasswordData): Promise<void> => {
  // Find valid reset token
  const resetToken = await PasswordResetToken.findOne({
    token: data.token,
    used: false,
    expiresAt: { $gt: new Date() },
  }).populate('userId');

  if (!resetToken) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const user = await User.findById(resetToken.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isActive) {
    throw new AppError('User account is inactive', 403);
  }

  // Check if user has OAuth (can't reset password)
  if (user.oauthProvider) {
    throw new AppError('Password reset not available for OAuth accounts', 400);
  }

  // Update password
  user.password = data.newPassword;
  await user.save();

  // Mark token as used
  resetToken.used = true;
  await resetToken.save();

  // Send confirmation email
  await emailService.sendPasswordResetConfirmationEmail(user);

  logger.info('Password reset completed', { userId: user._id.toString() });
};

export const authService = {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshAccessToken,
  blacklistToken,
  isTokenBlacklisted,
  forgotPassword,
  resetPassword,
};
