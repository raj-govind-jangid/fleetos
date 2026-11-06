import { CreateDriverInput, UpdateDriverInput } from '../validators/driver.validator';
import { NotFoundError } from '../utils/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../utils/pagination';
import type { IDriver } from '../models/Driver';
import { Driver, Trip, Vehicle } from '../models';

export async function listDrivers(query: PaginationQuery & { status?: string }) {
  const { page, limit, skip, sort } = parsePagination(query);

  const filter: Record<string, unknown> = {};
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { employeeId: new RegExp(query.search, 'i') },
      { licenseNumber: new RegExp(query.search, 'i') },
      { phone: new RegExp(query.search, 'i') },
    ];
  }
  if (query.status) filter.status = query.status as IDriver['status'];

  const [data, total] = await Promise.all([
    Driver.find(filter).sort(sort).skip(skip).limit(limit),
    Driver.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getDriverById(id: string) {
  const driver = await Driver.findById(id);
  if (!driver) throw new NotFoundError('Driver not found', 'DRIVER_NOT_FOUND');

  const [assignedVehicle, trips] = await Promise.all([
    Vehicle.findOne({ assignedDriverId: id }).select(
      'registrationNumber make model status'
    ),
    Trip.find({ driverId: id }).sort({ startDate: -1 }).limit(10),
  ]);

  return { driver, assignedVehicle, recentTrips: trips };
}

export async function createDriver(input: CreateDriverInput) {
  return Driver.create({
    ...input,
    email: input.email || undefined,
  });
}

export async function updateDriver(id: string, input: UpdateDriverInput) {
  const driver = await Driver.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!driver) throw new NotFoundError('Driver not found', 'DRIVER_NOT_FOUND');
  return driver;
}

export async function deleteDriver(id: string) {
  await Vehicle.updateMany({ assignedDriverId: id }, { assignedDriverId: null });
  const driver = await Driver.findByIdAndDelete(id);
  if (!driver) throw new NotFoundError('Driver not found', 'DRIVER_NOT_FOUND');
  return driver;
}
