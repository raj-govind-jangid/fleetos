import { api } from './api';
import type { ApiPaginated, ApiSuccess, PaginationParams } from '../types/common';
import type { Alert } from '../types/operations';

export interface AlertListParams extends PaginationParams {
  isRead?: boolean | string;
  severity?: string;
}

export async function listAlerts(params: AlertListParams = {}) {
  const { isRead, ...rest } = params;
  const query = {
    ...rest,
    ...(isRead !== undefined ? { isRead: String(isRead) } : {}),
  };
  const { data } = await api.get<ApiPaginated<Alert>>('/alerts', { params: query });
  return { data: data.data, pagination: data.pagination };
}

export async function markAlertRead(id: string) {
  const { data } = await api.patch<ApiSuccess<Alert>>(`/alerts/${id}/read`);
  return data.data;
}

export async function markAllAlertsRead() {
  const { data } = await api.post<ApiSuccess<null>>('/alerts/read-all');
  return data;
}

export async function generateAlerts() {
  const { data } = await api.post<ApiSuccess<{ created?: number }>>('/alerts/generate');
  return data.data;
}
