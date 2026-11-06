import { Request, Response, NextFunction } from 'express';
import * as alertService from '../services/alert.service';
import { getParamId } from '../utils/params';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await alertService.listAlerts({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      isRead: req.query.isRead as string | undefined,
      severity: req.query.severity as string | undefined,
    });
    sendPaginated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const alert = await alertService.markAlertRead(getParamId(req));
    sendSuccess(res, alert, 'Alert marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(_req: Request, res: Response, next: NextFunction) {
  try {
    await alertService.markAllAlertsRead();
    sendSuccess(res, null, 'All alerts marked as read');
  } catch (error) {
    next(error);
  }
}

export async function generate(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await alertService.generateAlerts();
    sendSuccess(res, result, 'Alerts generated');
  } catch (error) {
    next(error);
  }
}
