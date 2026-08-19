import { User, IUser } from './user.model';
import { AppError } from '../../core/exceptions/errorHandler';

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export const updateProfile = async (
  userId: string,
  data: UpdateProfileData
): Promise<Omit<IUser, 'password'>> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isActive) {
    throw new AppError('User account is inactive', 403);
  }

  // Check if email is being changed and if it's already taken
  if (data.email && data.email.toLowerCase() !== user.email) {
    const existingUser = await User.findOne({
      email: data.email.toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new AppError('Email is already in use', 400);
    }

    user.email = data.email.toLowerCase();
  }

  if (data.name !== undefined) {
    user.name = data.name;
  }

  await user.save();

  const userObject = user.toObject() as unknown as Record<string, unknown>;
  delete userObject.password;

  return userObject as Omit<IUser, 'password'>;
};

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (
  userId: string,
  data: ChangePasswordData
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isActive) {
    throw new AppError('User account is inactive', 403);
  }

  const isPasswordValid = await user.comparePassword(data.currentPassword);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = data.newPassword;
  await user.save();
};

export interface UpdateOnboardingProfileData {
  name?: string;
  phoneNumber?: string;
  company?: string;
  preferences?: Record<string, unknown>;
}

export const updateOnboardingProfile = async (
  userId: string,
  data: UpdateOnboardingProfileData
): Promise<Omit<IUser, 'password'>> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isActive) {
    throw new AppError('User account is inactive', 403);
  }

  if (data.name !== undefined) {
    user.name = data.name;
  }
  if (data.phoneNumber !== undefined) {
    user.phoneNumber = data.phoneNumber;
  }
  if (data.company !== undefined) {
    user.company = data.company;
  }
  if (data.preferences !== undefined) {
    user.preferences = data.preferences;
  }

  await user.save();

  const userObject = user.toObject() as unknown as Record<string, unknown>;
  delete userObject.password;

  return userObject as Omit<IUser, 'password'>;
};

export const completeOnboarding = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isActive) {
    throw new AppError('User account is inactive', 403);
  }

  user.onboardingCompleted = true;
  user.onboardingCompletedAt = new Date();
  await user.save();
};

export const getOnboardingStatus = async (userId: string): Promise<{
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  profileComplete: number;
}> => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Calculate profile completion percentage
  let complete = 0;
  const fields = ['email', 'name', 'phoneNumber', 'company'];
  fields.forEach((field) => {
    if (user[field as keyof typeof user]) {
      complete += 25;
    }
  });

  return {
    onboardingCompleted: user.onboardingCompleted,
    onboardingCompletedAt: user.onboardingCompletedAt,
    profileComplete: complete,
  };
};

export const userService = {
  updateProfile,
  changePassword,
  updateOnboardingProfile,
  completeOnboarding,
  getOnboardingStatus,
};

