export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiPaginated<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  errors?: unknown;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'FLEET_MANAGER'
  | 'ACCOUNTANT'
  | 'DRIVER'
  | 'VIEWER'
  | 'READ_ONLY';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
