import { Request } from 'express';

/** Normalize Express route params to a single string id. */
export function getParamId(req: Request, key = 'id'): string {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}
