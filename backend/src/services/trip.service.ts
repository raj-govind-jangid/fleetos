import { CreateTripInput, UpdateTripInput } from '../validators/trip.validator';
import { NotFoundError } from '../utils/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../utils/pagination';
import type { ITrip } from '../models/Trip';
import { Driver, Trip, Vehicle } from '../models';

export async function listTrips(
  query: PaginationQuery & { status?: string; vehicleId?: string; driverId?: string }
) {
  const { page, limit, skip, sort } = parsePagination(query, 'startDate');

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status as ITrip['status'];
  if (query.vehicleId) filter.vehicleId = query.vehicleId as unknown as ITrip['vehicleId'];
  if (query.driverId) filter.driverId = query.driverId as unknown as ITrip['driverId'];
  if (query.search) {
    filter.$or = [
      { source: new RegExp(query.search, 'i') },
      { destination: new RegExp(query.search, 'i') },
    ];
  }

  const [data, total] = await Promise.all([
    Trip.find(filter)
      .populate('vehicleId', 'registrationNumber make model')
      .populate('driverId', 'name phone employeeId')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Trip.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getTripById(id: string) {
  const trip = await Trip.findById(id)
    .populate('vehicleId', 'registrationNumber make model currentOdometer')
    .populate('driverId', 'name phone employeeId licenseNumber');
  if (!trip) throw new NotFoundError('Trip not found', 'TRIP_NOT_FOUND');
  return trip;
}

export async function createTrip(input: CreateTripInput) {
  const [vehicle, driver] = await Promise.all([
    Vehicle.findById(input.vehicleId),
    Driver.findById(input.driverId),
  ]);
  if (!vehicle) throw new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');
  if (!driver) throw new NotFoundError('Driver not found', 'DRIVER_NOT_FOUND');

  return Trip.create(input);
}

export async function updateTrip(id: string, input: UpdateTripInput) {
  if (input.status === 'COMPLETED' && input.endOdometer !== undefined) {
    const trip = await Trip.findById(id);
    if (trip) {
      await Vehicle.findByIdAndUpdate(trip.vehicleId, {
        currentOdometer: input.endOdometer,
      });
    }
  }

  const trip = await Trip.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  })
    .populate('vehicleId', 'registrationNumber make model')
    .populate('driverId', 'name phone employeeId');

  if (!trip) throw new NotFoundError('Trip not found', 'TRIP_NOT_FOUND');
  return trip;
}

export async function deleteTrip(id: string) {
  const trip = await Trip.findByIdAndDelete(id);
  if (!trip) throw new NotFoundError('Trip not found', 'TRIP_NOT_FOUND');
  return trip;
}
