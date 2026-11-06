import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import {
  ChangePasswordInput,
  LoginInput,
  UpdateProfileInput,
} from '../validators/auth.validator';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body as LoginInput);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);
    sendSuccess(res, user, 'Current user');
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.updateProfile(req.user!.userId, req.body as UpdateProfileInput);
    sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.changePassword(req.user!.userId, req.body as ChangePasswordInput);
    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response) {
  sendSuccess(res, null, 'Logged out successfully');
}
