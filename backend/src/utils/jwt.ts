import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';

export const generateToken = (payload: JWTPayload): string => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const options: SignOptions = { expiresIn: expiresIn as any };

  return jwt.sign(payload, JWT_SECRET, options) as string;
};

export const verifyToken = (token: string): JWTPayload => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};