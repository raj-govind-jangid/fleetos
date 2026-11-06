import { NotFoundError } from '../utils/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../utils/pagination';
import type { IExpense } from '../models/Expense';
import { Expense, Vehicle } from '../models';
import { z } from 'zod';
import { createExpenseSchema } from '../validators/common.validator';

type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export async function listExpenses(
  query: PaginationQuery & { category?: string; vehicleId?: string }
) {
  const { page, limit, skip, sort } = parsePagination(query, 'date');

  const filter: Record<string, unknown> = {};
  if (query.category) filter.category = query.category as IExpense['category'];
  if (query.vehicleId) filter.vehicleId = query.vehicleId as unknown as IExpense['vehicleId'];
  if (query.search) {
    filter.$or = [
      { description: new RegExp(query.search, 'i') },
      { referenceNumber: new RegExp(query.search, 'i') },
    ];
  }

  const [data, total] = await Promise.all([
    Expense.find(filter)
      .populate('vehicleId', 'registrationNumber make model')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(page, limit, total) };
}

export async function createExpense(input: CreateExpenseInput) {
  if (input.vehicleId) {
    const vehicle = await Vehicle.findById(input.vehicleId);
    if (!vehicle) throw new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');
  }
  return Expense.create({
    ...input,
    vehicleId: input.vehicleId || null,
  });
}

export async function deleteExpense(id: string) {
  const expense = await Expense.findByIdAndDelete(id);
  if (!expense) throw new NotFoundError('Expense not found', 'EXPENSE_NOT_FOUND');
  return expense;
}
