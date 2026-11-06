import { api } from './api';
import type { ApiPaginated, ApiSuccess, PaginationParams } from '../types/common';
import type { DocumentInput, VehicleDocument } from '../types/operations';

export interface DocumentListParams extends PaginationParams {
  vehicleId?: string;
  documentType?: string;
  status?: string;
}

export async function listDocuments(params: DocumentListParams = {}) {
  const { data } = await api.get<ApiPaginated<VehicleDocument>>('/documents', { params });
  return { data: data.data, pagination: data.pagination };
}

export async function createDocument(payload: DocumentInput) {
  const formData = new FormData();
  formData.append('vehicleId', payload.vehicleId);
  formData.append('documentType', payload.documentType);
  formData.append('documentNumber', payload.documentNumber);
  formData.append('issueDate', payload.issueDate);
  formData.append('expiryDate', payload.expiryDate);
  if (payload.file) {
    formData.append('file', payload.file);
  }

  const { data } = await api.post<ApiSuccess<VehicleDocument>>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteDocument(id: string) {
  const { data } = await api.delete<ApiSuccess<null>>(`/documents/${id}`);
  return data;
}
