import { Request, Response, NextFunction } from 'express';
import * as driverService from '../services/driver.service';
import { getParamId } from '../utils/params';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await driverService.listDrivers({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      search: req.query.search as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      status: req.query.status as string | undefined,
    });
    sendPaginated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await driverService.getDriverById(getParamId(req));
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await driverService.createDriver(req.body);
    sendSuccess(res, driver, 'Driver created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await driverService.updateDriver(getParamId(req), req.body);
    sendSuccess(res, driver, 'Driver updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await driverService.deleteDriver(getParamId(req));
    sendSuccess(res, null, 'Driver deleted successfully');
  } catch (error) {
    next(error);
  }
}
