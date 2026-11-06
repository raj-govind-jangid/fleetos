import type { UserRole, UserStatus } from './common';

export type { UserRole, UserStatus };

export interface OrganizationSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  status?: UserStatus;
  organization?: OrganizationSummary | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  organization: OrganizationSummary;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Organization {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrgUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'SUPER_ADMIN'>;
}

export interface UpdateProfileInput {
  name: string;
  email: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
