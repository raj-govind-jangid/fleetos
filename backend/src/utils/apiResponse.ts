import { Response } from 'express';

export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  errors?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  } satisfies ApiSuccess<T>);
}

export function sendPaginated<T>(
  res: Response,
  payload: PaginatedData<T>,
  message = 'Success'
): Response {
  return res.status(200).json({
    success: true,
    message,
    data: payload.data,
    pagination: payload.pagination,
  });
}

export function sendError(
  res: Response,
  message: string,
  code: string,
  statusCode = 400,
  errors?: unknown
): Response {
  const body: ApiError = {
    success: false,
    message,
    code,
  };
  if (errors !== undefined) {
    body.errors = errors;
  }
  return res.status(statusCode).json(body);
}
