import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    profileImageUrl?: string;
  };
  token: string;
}