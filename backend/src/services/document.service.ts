import { NotFoundError } from '../utils/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../utils/pagination';
import { calculateDocumentStatus } from '../models/VehicleDocument';
import { Vehicle, VehicleDocument } from '../models';
import { z } from 'zod';
import { createDocumentSchema } from '../validators/common.validator';

type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export async function listDocuments(
  query: PaginationQuery & { vehicleId?: string; documentType?: string; status?: string }
) {
  const { page, limit, skip, sort } = parsePagination(query, 'expiryDate');

  const filter: Record<string, unknown> = {};
  if (query.vehicleId) filter.vehicleId = query.vehicleId;
  if (query.documentType) filter.documentType = query.documentType;
  if (query.status) filter.status = query.status;

  const [data, total] = await Promise.all([
    VehicleDocument.find(filter)
      .populate('vehicleId', 'registrationNumber make model')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    VehicleDocument.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(page, limit, total) };
}

export async function createDocument(input: CreateDocumentInput) {
  const vehicle = await Vehicle.findById(input.vehicleId);
  if (!vehicle) throw new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');

  return VehicleDocument.create({
    ...input,
    status: calculateDocumentStatus(input.expiryDate),
  });
}

export async function deleteDocument(id: string) {
  const doc = await VehicleDocument.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError('Document not found', 'DOCUMENT_NOT_FOUND');
  return doc;
}

export async function refreshDocumentStatuses() {
  const docs = await VehicleDocument.find();
  for (const doc of docs) {
    const status = calculateDocumentStatus(doc.expiryDate);
    if (doc.status !== status) {
      doc.status = status;
      await doc.save();
    }
  }
}
