import { api } from './api';
import type { ApiPaginated, ApiSuccess, PaginationParams } from '../types/common';
import type { Vehicle, VehicleInput } from '../types/vehicle';

export interface VehicleListParams extends PaginationParams {
  status?: string;
  vehicleType?: string;
}

export async function listVehicles(params: VehicleListParams = {}) {
  const { data } = await api.get<ApiPaginated<Vehicle>>('/vehicles', { params });
  return { data: data.data, pagination: data.pagination };
}

export async function getVehicle(id: string) {
  const { data } = await api.get<ApiSuccess<Vehicle>>(`/vehicles/${id}`);
  return data.data;
}

export async function createVehicle(payload: VehicleInput) {
  const { data } = await api.post<ApiSuccess<Vehicle>>('/vehicles', payload);
  return data.data;
}

export async function updateVehicle(id: string, payload: Partial<VehicleInput>) {
  const { data } = await api.put<ApiSuccess<Vehicle>>(`/vehicles/${id}`, payload);
  return data.data;
}

export async function deleteVehicle(id: string) {
  const { data } = await api.delete<ApiSuccess<null>>(`/vehicles/${id}`);
  return data;
}

export async function assignDriver(id: string, driverId: string | null) {
  const { data } = await api.patch<ApiSuccess<Vehicle>>(`/vehicles/${id}/assign-driver`, {
    driverId,
  });
  return data.data;
}
