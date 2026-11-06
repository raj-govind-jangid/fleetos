import { Request, Response, NextFunction } from 'express';
import * as documentService from '../services/document.service';
import { getParamId } from '../utils/params';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await documentService.listDocuments({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      vehicleId: req.query.vehicleId as string | undefined,
      documentType: req.query.documentType as string | undefined,
      status: req.query.status as string | undefined,
    });
    sendPaginated(res, result);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await documentService.createDocument({
      ...req.body,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
    });
    sendSuccess(res, doc, 'Document created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await documentService.deleteDocument(getParamId(req));
    sendSuccess(res, null, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
}
