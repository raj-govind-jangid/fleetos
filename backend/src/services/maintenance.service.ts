import { NotFoundError } from '../utils/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../utils/pagination';
import type { IMaintenanceRecord } from '../models/MaintenanceRecord';
import { z } from 'zod';
import { createMaintenanceSchema } from '../validators/common.validator';
import { Expense, MaintenanceRecord, Vehicle } from '../models';

type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;

export async function listMaintenance(
  query: PaginationQuery & { vehicleId?: string; status?: string }
) {
  const { page, limit, skip, sort } = parsePagination(query, 'serviceDate');

  const filter: Record<string, unknown> = {};
  if (query.vehicleId) {
    filter.vehicleId = query.vehicleId as unknown as IMaintenanceRecord['vehicleId'];
  }
  if (query.status) filter.status = query.status as IMaintenanceRecord['status'];

  const [data, total] = await Promise.all([
    MaintenanceRecord.find(filter)
      .populate('vehicleId', 'registrationNumber make model')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    MaintenanceRecord.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(page, limit, total) };
}

export async function createMaintenance(input: CreateMaintenanceInput) {
  const vehicle = await Vehicle.findById(input.vehicleId);
  if (!vehicle) throw new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');

  const record = await MaintenanceRecord.create(input);

  if (input.status === 'IN_PROGRESS' || input.maintenanceType === 'EMERGENCY') {
    vehicle.status = 'MAINTENANCE';
    await vehicle.save();
  }

  await Expense.create({
    vehicleId: input.vehicleId,
    category: 'MAINTENANCE',
    amount: input.cost,
    date: input.serviceDate,
    description: input.description,
    referenceNumber: record._id.toString(),
  });

  return MaintenanceRecord.findById(record._id).populate(
    'vehicleId',
    'registrationNumber make model'
  );
}

export async function updateMaintenance(
  id: string,
  input: Partial<CreateMaintenanceInput>
) {
  const record = await MaintenanceRecord.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  }).populate('vehicleId', 'registrationNumber make model');

  if (!record) throw new NotFoundError('Maintenance record not found', 'MAINTENANCE_NOT_FOUND');
  return record;
}

export async function deleteMaintenance(id: string) {
  const record = await MaintenanceRecord.findByIdAndDelete(id);
  if (!record) throw new NotFoundError('Maintenance record not found', 'MAINTENANCE_NOT_FOUND');
  return record;
}

export async function getUpcomingMaintenance() {
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  return MaintenanceRecord.find({
    nextServiceDate: { $lte: in30Days, $gte: new Date() },
  })
    .populate('vehicleId', 'registrationNumber make model currentOdometer')
    .sort({ nextServiceDate: 1 })
    .limit(20);
}
