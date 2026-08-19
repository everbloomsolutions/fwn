/**
 * OAuth service
 * Handles OAuth authentication logic
 */

import { User, IUser } from '../user/user.model';
import { AppError } from '../../core/exceptions/errorHandler';
import { generateToken, generateRefreshToken } from '../../core/utils/jwt';

export type OAuthProvider = 'google' | 'facebook' | 'linkedin';

export interface OAuthProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  photos?: Array<{ value: string }>;
}

export interface OAuthUserData {
  provider: OAuthProvider;
  oauthId: string;
  email: string;
  name?: string;
  avatar?: string;
}

/**
 * Find or create user from OAuth profile
 * Returns user and isNewUser flag
 */
export const findOrCreateOAuthUser = async (
  profile: OAuthProfile,
  provider: OAuthProvider
): Promise<{ user: IUser; isNewUser: boolean }> => {
  const oauthId = profile.id;
  const email = profile.email?.toLowerCase();

  if (!email) {
    throw new AppError('Email is required for OAuth authentication', 400);
  }

  const avatar =
    profile.picture || profile.photos?.[0]?.value || undefined;

  let user = await User.findOne({
    $or: [
      { oauthId, oauthProvider: provider },
      { email },
    ],
  });

  let isNewUser = false;

  if (user) {
    if (!user.oauthProvider || user.oauthProvider !== provider) {
      user.oauthProvider = provider;
      user.oauthId = oauthId;
      if (avatar) user.avatar = avatar;
      if (profile.name && !user.name) user.name = profile.name;
      await user.save();
    } else {
      if (avatar) user.avatar = avatar;
      if (profile.name && !user.name) user.name = profile.name;
      await user.save();
    }
    isNewUser = false;
  } else {
    user = new User({
      email,
      name: profile.name,
      oauthProvider: provider,
      oauthId,
      avatar,
      role: 'user',
      isActive: true,
      onboardingCompleted: false,
    });
    await user.save();
    isNewUser = true;
  }

  if (!user.isActive) {
    throw new AppError('User account is inactive', 403);
  }

  return { user, isNewUser };
};

/**
 * Generate tokens for OAuth user
 */
export const generateOAuthTokens = async (
  user: IUser
): Promise<{ token: string; refreshToken: string }> => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  
  const token = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { token, refreshToken };
};

