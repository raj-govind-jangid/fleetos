import { User, Organization } from '../models';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError, UnauthorizedError, NotFoundError } from '../utils/AppError';
import {
  ChangePasswordInput,
  LoginInput,
  UpdateProfileInput,
} from '../validators/auth.validator';

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Account is inactive', 'USER_INACTIVE');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const organization = await Organization.findById(user.organizationId);
  if (!organization || organization.status !== 'ACTIVE') {
    throw new UnauthorizedError('Organization is inactive', 'ORG_INACTIVE');
  }

  const token = signToken({
    userId: user._id.toString(),
    organizationId: organization._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: organization._id.toString(),
    },
    organization: {
      id: organization._id.toString(),
      name: organization.name,
      email: organization.email,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  const organization = await Organization.findById(user.organizationId);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    organizationId: user.organizationId.toString(),
    organization: organization
      ? {
          id: organization._id.toString(),
          name: organization.name,
          email: organization.email,
          phone: organization.phone,
          address: organization.address,
          city: organization.city,
          state: organization.state,
          country: organization.country,
          status: organization.status,
        }
      : null,
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  const email = input.email.toLowerCase().trim();
  if (email !== user.email) {
    const existing = await User.findOne({ email, _id: { $ne: user._id } });
    if (existing) {
      throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
    }
  }

  user.name = input.name.trim();
  user.email = email;
  await user.save();

  return getCurrentUser(userId);
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  const valid = await comparePassword(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Current password is incorrect', 'INVALID_PASSWORD');
  }

  user.passwordHash = await hashPassword(input.newPassword);
  await user.save();
}
