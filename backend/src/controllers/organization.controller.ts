import { Request, Response, NextFunction } from 'express';
import { Organization, User } from '../models';
import { hashPassword } from '../utils/password';
import { getParamId } from '../utils/params';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError, ForbiddenError, AppError } from '../utils/AppError';

export async function getOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const org = await Organization.findById(req.user!.organizationId);
    if (!org) throw new NotFoundError('Organization not found', 'ORG_NOT_FOUND');
    sendSuccess(res, org);
  } catch (error) {
    next(error);
  }
}

export async function updateOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new ForbiddenError();
    }
    const org = await Organization.findByIdAndUpdate(req.user!.organizationId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!org) throw new NotFoundError('Organization not found', 'ORG_NOT_FOUND');
    sendSuccess(res, org, 'Organization updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find({ organizationId: req.user!.organizationId })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new ForbiddenError();
    }

    const existing = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existing) {
      throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(req.body.password);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      passwordHash,
      role: req.body.role,
      organizationId: req.user!.organizationId,
      status: 'ACTIVE',
    });

    sendSuccess(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      'User created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new ForbiddenError();
    }

    const user = await User.findOneAndUpdate(
      { _id: getParamId(req), organizationId: req.user!.organizationId },
      { status: req.body.status },
      { new: true }
    ).select('-passwordHash');

    if (!user) throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
}
