import { Request, Response, NextFunction } from 'express';
import * as vehicleService from '../services/vehicle.service';
import { getParamId } from '../utils/params';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await vehicleService.listVehicles({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      search: req.query.search as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      status: req.query.status as string | undefined,
      vehicleType: req.query.vehicleType as string | undefined,
    });
    sendPaginated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await vehicleService.getVehicleById(getParamId(req));
    sendSuccess(res, vehicle);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    sendSuccess(res, vehicle, 'Vehicle created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await vehicleService.updateVehicle(getParamId(req), req.body);
    sendSuccess(res, vehicle, 'Vehicle updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await vehicleService.deleteVehicle(getParamId(req));
    sendSuccess(res, null, 'Vehicle deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function assignDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await vehicleService.assignDriver(getParamId(req), req.body.driverId);
    sendSuccess(res, vehicle, 'Driver assigned successfully');
  } catch (error) {
    next(error);
  }
}
