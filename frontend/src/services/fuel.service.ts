import { api } from './api';
import type { ApiPaginated, ApiSuccess, PaginationParams } from '../types/common';
import type { FuelInput, FuelRecord, FuelSummary } from '../types/operations';

export interface FuelListParams extends PaginationParams {
  vehicleId?: string;
}

export async function listFuel(params: FuelListParams = {}) {
  const { data } = await api.get<ApiPaginated<FuelRecord>>('/fuel', { params });
  return { data: data.data, pagination: data.pagination };
}

export async function createFuel(payload: FuelInput) {
  const { data } = await api.post<ApiSuccess<FuelRecord>>('/fuel', payload);
  return data.data;
}

export async function deleteFuel(id: string) {
  const { data } = await api.delete<ApiSuccess<null>>(`/fuel/${id}`);
  return data;
}

export async function getFuelSummary() {
  const { data } = await api.get<ApiSuccess<FuelSummary>>('/fuel/summary');
  return data.data;
}
