import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'admin' | 'guest';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  isGuest: boolean;
  oauthProvider?: 'google' | 'facebook' | 'linkedin';
  oauthId?: string;
  avatar?: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  phoneNumber?: string;
  company?: string;
  preferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Type for user data without password (for API responses)
export interface IUserResponse {
  _id: string;
  email: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  isGuest: boolean;
  oauthProvider?: 'google' | 'facebook' | 'linkedin';
  oauthId?: string;
  avatar?: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  phoneNumber?: string;
  company?: string;
  preferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to convert user to response type
export const toUserResponse = (user: IUser | Record<string, unknown>): IUserResponse => {
  const obj = 'toObject' in user && typeof user.toObject === 'function'
    ? user.toObject()
    : user;
  const userObj = obj as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = userObj;
  return {
    ...userWithoutPassword,
    _id: userObj._id?.toString() || '',
  } as unknown as IUserResponse;
};

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.oauthProvider && !this.isGuest;
      },
      minlength: [8, 'Password must be at least 8 characters long'],
      validate: {
        validator: function (v: string) {
          // Allow empty/undefined if guest or OAuth
          if (!v) return true;
          // Require at least: 1 lowercase, 1 uppercase, 1 number
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
        },
        message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      },
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'guest'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    oauthProvider: {
      type: String,
      enum: ['google', 'facebook', 'linkedin'],
    },
    oauthId: {
      type: String,
    },
    avatar: {
      type: String,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingCompletedAt: {
      type: Date,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    preferences: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if password exists and is modified)
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
