import { api } from './api';
import type { ApiSuccess } from '../types/common';
import type { CreateUserInput, Organization, OrgUser, UserStatus } from '../types/auth';

export async function getOrganization() {
  const { data } = await api.get<ApiSuccess<Organization>>('/organization');
  return data.data;
}

export async function updateOrganization(payload: Partial<Organization>) {
  const { data } = await api.put<ApiSuccess<Organization>>('/organization', payload);
  return data.data;
}

export async function listUsers() {
  const { data } = await api.get<ApiSuccess<OrgUser[]>>('/organization/users');
  return data.data;
}

export async function createUser(payload: CreateUserInput) {
  const { data } = await api.post<ApiSuccess<OrgUser>>('/organization/users', payload);
  return data.data;
}

export async function updateUserStatus(id: string, status: UserStatus) {
  const { data } = await api.patch<ApiSuccess<OrgUser>>(`/organization/users/${id}/status`, {
    status,
  });
  return data.data;
}
