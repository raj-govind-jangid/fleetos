import { Request, Response, NextFunction } from 'express';
import * as maintenanceService from '../services/maintenance.service';
import { getParamId } from '../utils/params';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await maintenanceService.listMaintenance({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      vehicleId: req.query.vehicleId as string | undefined,
      status: req.query.status as string | undefined,
    });
    sendPaginated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await maintenanceService.createMaintenance(req.body);
    sendSuccess(res, record, 'Maintenance record created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await maintenanceService.updateMaintenance(getParamId(req), req.body);
    sendSuccess(res, record, 'Maintenance record updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await maintenanceService.deleteMaintenance(getParamId(req));
    sendSuccess(res, null, 'Maintenance record deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function upcoming(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await maintenanceService.getUpcomingMaintenance();
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}
