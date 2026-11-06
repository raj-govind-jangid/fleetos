import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'FLEET_MANAGER'
  | 'ACCOUNTANT'
  | 'DRIVER'
  | 'VIEWER'
  | 'READ_ONLY';

export interface JwtPayload {
  userId: string;
  organizationId: string;
  role: UserRole;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
