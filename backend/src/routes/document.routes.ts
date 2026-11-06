import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as documentController from '../controllers/document.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createDocumentSchema } from '../validators/common.validator';
import { env } from '../config/env';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.use(authenticate);

router.get('/', documentController.list);
router.post(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  upload.single('file'),
  validate(createDocumentSchema),
  documentController.create
);
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  documentController.remove
);

export default router;
