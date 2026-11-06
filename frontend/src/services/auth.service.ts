import { api } from './api';
import type { ApiSuccess } from '../types/common';
import type {
  AuthUser,
  ChangePasswordInput,
  LoginCredentials,
  LoginResponse,
  UpdateProfileInput,
} from '../types/auth';

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<ApiSuccess<LoginResponse>>('/auth/login', credentials);
  return data.data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<ApiSuccess<AuthUser>>('/auth/me');
  return data.data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  const { data } = await api.put<ApiSuccess<AuthUser>>('/auth/me', input);
  return data.data;
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await api.post('/auth/change-password', input);
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
