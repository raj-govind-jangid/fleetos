import { Request, Response, NextFunction } from 'express';
import * as tripService from '../services/trip.service';
import { getParamId } from '../utils/params';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tripService.listTrips({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      search: req.query.search as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      status: req.query.status as string | undefined,
      vehicleId: req.query.vehicleId as string | undefined,
      driverId: req.query.driverId as string | undefined,
    });
    sendPaginated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.getTripById(getParamId(req));
    sendSuccess(res, trip);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.createTrip(req.body);
    sendSuccess(res, trip, 'Trip created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.updateTrip(getParamId(req), req.body);
    sendSuccess(res, trip, 'Trip updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await tripService.deleteTrip(getParamId(req));
    sendSuccess(res, null, 'Trip deleted successfully');
  } catch (error) {
    next(error);
  }
}
