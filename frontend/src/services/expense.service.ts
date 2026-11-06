import { api } from './api';
import type { ApiPaginated, ApiSuccess, PaginationParams } from '../types/common';
import type { Expense, ExpenseInput } from '../types/operations';

export interface ExpenseListParams extends PaginationParams {
  category?: string;
  vehicleId?: string;
}

export async function listExpenses(params: ExpenseListParams = {}) {
  const { data } = await api.get<ApiPaginated<Expense>>('/expenses', { params });
  return { data: data.data, pagination: data.pagination };
}

export async function createExpense(payload: ExpenseInput) {
  const { data } = await api.post<ApiSuccess<Expense>>('/expenses', payload);
  return data.data;
}

export async function deleteExpense(id: string) {
  const { data } = await api.delete<ApiSuccess<null>>(`/expenses/${id}`);
  return data;
}
