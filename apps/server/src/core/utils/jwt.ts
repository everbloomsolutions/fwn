import jwt from 'jsonwebtoken';
import { config } from '../config';

export type TokenType = 'access' | 'refresh';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string, type: TokenType = 'access'): TokenPayload => {
  const secret = type === 'refresh' ? config.jwtRefreshSecret : config.jwtSecret;
  return jwt.verify(token, secret) as TokenPayload;
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return verifyToken(token, 'access');
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return verifyToken(token, 'refresh');
};

export const generateTokens = (userId: string, email?: string, role?: string): { token: string; refreshToken: string } => {
  const payload: TokenPayload = {
    userId,
    email: email ?? '',
    role: role ?? 'user',
  };
  return {
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

