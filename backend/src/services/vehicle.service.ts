import { CreateVehicleInput, UpdateVehicleInput } from '../validators/vehicle.validator';
import { NotFoundError } from '../utils/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../utils/pagination';
import { Driver, Vehicle } from '../models';
import type { IVehicle } from '../models/Vehicle';

export async function listVehicles(query: PaginationQuery & { status?: string; vehicleType?: string }) {
  const { page, limit, skip, sort } = parsePagination(query);

  const filter: Record<string, unknown> = {};
  if (query.search) {
    filter.$or = [
      { registrationNumber: new RegExp(query.search, 'i') },
      { make: new RegExp(query.search, 'i') },
      { model: new RegExp(query.search, 'i') },
      { vin: new RegExp(query.search, 'i') },
    ];
  }
  if (query.status) filter.status = query.status as IVehicle['status'];
  if (query.vehicleType) filter.vehicleType = query.vehicleType as IVehicle['vehicleType'];

  const [data, total] = await Promise.all([
    Vehicle.find(filter)
      .populate('assignedDriverId', 'name phone employeeId')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Vehicle.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getVehicleById(id: string) {
  const vehicle = await Vehicle.findById(id).populate(
    'assignedDriverId',
    'name phone employeeId licenseNumber'
  );
  if (!vehicle) throw new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');
  return vehicle;
}

export async function createVehicle(input: CreateVehicleInput) {
  return Vehicle.create({
    ...input,
    registrationNumber: input.registrationNumber.toUpperCase(),
    assignedDriverId: input.assignedDriverId || null,
  });
}

export async function updateVehicle(id: string, input: UpdateVehicleInput) {
  const vehicle = await Vehicle.findByIdAndUpdate(
    id,
    {
      ...input,
      ...(input.registrationNumber
        ? { registrationNumber: input.registrationNumber.toUpperCase() }
        : {}),
      ...(input.assignedDriverId !== undefined
        ? { assignedDriverId: input.assignedDriverId || null }
        : {}),
    },
    { new: true, runValidators: true }
  ).populate('assignedDriverId', 'name phone employeeId');

  if (!vehicle) throw new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');
  return vehicle;
}

export async function deleteVehicle(id: string) {
  const vehicle = await Vehicle.findByIdAndDelete(id);
  if (!vehicle) throw new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');
  return vehicle;
}

export async function assignDriver(vehicleId: string, driverId: string | null) {
  if (driverId) {
    const driver = await Driver.findById(driverId);
    if (!driver) throw new NotFoundError('Driver not found', 'DRIVER_NOT_FOUND');
  }

  const vehicle = await Vehicle.findByIdAndUpdate(
    vehicleId,
    { assignedDriverId: driverId },
    { new: true }
  ).populate('assignedDriverId', 'name phone employeeId');

  if (!vehicle) throw new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');
  return vehicle;
}
