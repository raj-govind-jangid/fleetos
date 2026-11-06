import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload, UserRole } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';
import { User } from '../models';

export interface AuthUser {
  userId: string;
  organizationId: string;
  role: UserRole;
  name?: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token required', 'TOKEN_REQUIRED');
    }

    const token = header.slice(7);
    let payload: JwtPayload;

    try {
      payload = verifyToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired token', 'INVALID_TOKEN');
    }

    const user = await User.findById(payload.userId).select('status organizationId role name email');
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User account is inactive or not found', 'USER_INACTIVE');
    }

    // Tenant comes from authenticated user — never from the request body
    req.user = {
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      next(new ForbiddenError('You do not have permission to perform this action', 'FORBIDDEN'));
      return;
    }

    next();
  };
}
