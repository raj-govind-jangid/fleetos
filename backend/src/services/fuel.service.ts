import { NotFoundError } from '../utils/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../utils/pagination';
import type { IFuelRecord } from '../models/FuelRecord';
import { Expense, FuelRecord, Vehicle } from '../models';
import { z } from 'zod';
import { createFuelSchema } from '../validators/common.validator';

type CreateFuelInput = z.infer<typeof createFuelSchema>;

export async function listFuelRecords(
  query: PaginationQuery & { vehicleId?: string }
) {
  const { page, limit, skip, sort } = parsePagination(query, 'date');

  const filter: Record<string, unknown> = {};
  if (query.vehicleId) filter.vehicleId = query.vehicleId as unknown as IFuelRecord['vehicleId'];

  const [data, total] = await Promise.all([
    FuelRecord.find(filter)
      .populate('vehicleId', 'registrationNumber make model')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    FuelRecord.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(page, limit, total) };
}

export async function createFuelRecord(input: CreateFuelInput) {
  const vehicle = await Vehicle.findById(input.vehicleId);
  if (!vehicle) throw new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');

  const record = await FuelRecord.create(input);

  if (input.odometer > vehicle.currentOdometer) {
    vehicle.currentOdometer = input.odometer;
    await vehicle.save();
  }

  // Mirror as expense for reporting
  await Expense.create({
    vehicleId: input.vehicleId,
    category: 'FUEL',
    amount: Number((input.quantity * input.pricePerUnit).toFixed(2)),
    date: input.date,
    description: `Fuel: ${input.quantity}L @ ${input.pricePerUnit}`,
    referenceNumber: record._id.toString(),
  });

  return FuelRecord.findById(record._id).populate(
    'vehicleId',
    'registrationNumber make model'
  );
}

export async function deleteFuelRecord(id: string) {
  const record = await FuelRecord.findByIdAndDelete(id);
  if (!record) throw new NotFoundError('Fuel record not found', 'FUEL_NOT_FOUND');
  return record;
}

export async function getFuelSummary() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthly, byVehicle] = await Promise.all([
    FuelRecord.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
    ]),
    FuelRecord.aggregate([
      {
        $group: {
          _id: '$vehicleId',
          totalAmount: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicle',
        },
      },
      { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    monthly: monthly[0] || { totalAmount: 0, totalQuantity: 0, count: 0 },
    byVehicle,
  };
}
