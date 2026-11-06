import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';

export async function getDashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getDashboard();
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}
