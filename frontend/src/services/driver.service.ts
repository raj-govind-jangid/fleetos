import { api } from './api';
import type { ApiPaginated, ApiSuccess, PaginationParams } from '../types/common';
import type { Driver, DriverDetailsResponse, DriverInput } from '../types/driver';

export interface DriverListParams extends PaginationParams {
  status?: string;
}

export async function listDrivers(params: DriverListParams = {}) {
  const { data } = await api.get<ApiPaginated<Driver>>('/drivers', { params });
  return { data: data.data, pagination: data.pagination };
}

export async function getDriver(id: string) {
  const { data } = await api.get<ApiSuccess<DriverDetailsResponse>>(`/drivers/${id}`);
  return data.data;
}

export async function createDriver(payload: DriverInput) {
  const { data } = await api.post<ApiSuccess<Driver>>('/drivers', payload);
  return data.data;
}

export async function updateDriver(id: string, payload: Partial<DriverInput>) {
  const { data } = await api.put<ApiSuccess<Driver>>(`/drivers/${id}`, payload);
  return data.data;
}

export async function deleteDriver(id: string) {
  const { data } = await api.delete<ApiSuccess<null>>(`/drivers/${id}`);
  return data;
}
