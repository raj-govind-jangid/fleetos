import { api } from './api';
import type { ApiPaginated, ApiSuccess, PaginationParams } from '../types/common';
import type { Trip, TripInput, TripUpdateInput } from '../types/trip';

export interface TripListParams extends PaginationParams {
  status?: string;
  vehicleId?: string;
  driverId?: string;
}

export async function listTrips(params: TripListParams = {}) {
  const { data } = await api.get<ApiPaginated<Trip>>('/trips', { params });
  return { data: data.data, pagination: data.pagination };
}

export async function getTrip(id: string) {
  const { data } = await api.get<ApiSuccess<Trip>>(`/trips/${id}`);
  return data.data;
}

export async function createTrip(payload: TripInput) {
  const { data } = await api.post<ApiSuccess<Trip>>('/trips', payload);
  return data.data;
}

export async function updateTrip(id: string, payload: TripUpdateInput) {
  const { data } = await api.put<ApiSuccess<Trip>>(`/trips/${id}`, payload);
  return data.data;
}

export async function deleteTrip(id: string) {
  const { data } = await api.delete<ApiSuccess<null>>(`/trips/${id}`);
  return data;
}
