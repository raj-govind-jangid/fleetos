import { api } from './api';
import type { ApiPaginated, ApiSuccess, PaginationParams } from '../types/common';
import type { MaintenanceInput, MaintenanceRecord } from '../types/operations';

export interface MaintenanceListParams extends PaginationParams {
  vehicleId?: string;
  status?: string;
}

export async function listMaintenance(params: MaintenanceListParams = {}) {
  const { data } = await api.get<ApiPaginated<MaintenanceRecord>>('/maintenance', { params });
  return { data: data.data, pagination: data.pagination };
}

export async function createMaintenance(payload: MaintenanceInput) {
  const { data } = await api.post<ApiSuccess<MaintenanceRecord>>('/maintenance', payload);
  return data.data;
}

export async function updateMaintenance(id: string, payload: Partial<MaintenanceInput>) {
  const { data } = await api.put<ApiSuccess<MaintenanceRecord>>(`/maintenance/${id}`, payload);
  return data.data;
}

export async function deleteMaintenance(id: string) {
  const { data } = await api.delete<ApiSuccess<null>>(`/maintenance/${id}`);
  return data;
}

export async function getUpcomingMaintenance() {
  const { data } = await api.get<ApiSuccess<MaintenanceRecord[]>>('/maintenance/upcoming');
  return data.data;
}
