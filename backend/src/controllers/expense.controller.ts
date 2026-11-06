import { Request, Response, NextFunction } from 'express';
import * as expenseService from '../services/expense.service';
import { getParamId } from '../utils/params';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await expenseService.listExpenses({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      search: req.query.search as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      category: req.query.category as string | undefined,
      vehicleId: req.query.vehicleId as string | undefined,
    });
    sendPaginated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const expense = await expenseService.createExpense(req.body);
    sendSuccess(res, expense, 'Expense created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await expenseService.deleteExpense(getParamId(req));
    sendSuccess(res, null, 'Expense deleted successfully');
  } catch (error) {
    next(error);
  }
}
