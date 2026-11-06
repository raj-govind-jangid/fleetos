import { api } from './api';
import type { ApiSuccess } from '../types/common';
import type { DashboardData } from '../types/operations';

export async function getDashboard() {
  const { data } = await api.get<ApiSuccess<DashboardData>>('/dashboard');
  return data.data;
}
