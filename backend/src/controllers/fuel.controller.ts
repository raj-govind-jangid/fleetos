import { Request, Response, NextFunction } from 'express';
import * as fuelService from '../services/fuel.service';
import { getParamId } from '../utils/params';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await fuelService.listFuelRecords({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      vehicleId: req.query.vehicleId as string | undefined,
    });
    sendPaginated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await fuelService.createFuelRecord(req.body);
    sendSuccess(res, record, 'Fuel record created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await fuelService.deleteFuelRecord(getParamId(req));
    sendSuccess(res, null, 'Fuel record deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function summary(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fuelService.getFuelSummary();
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}
