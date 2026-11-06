import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createMaintenanceSchema } from '../validators/common.validator';

const router = Router();

router.use(authenticate);

router.get('/', maintenanceController.list);
router.get('/upcoming', maintenanceController.upcoming);
router.post(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  validate(createMaintenanceSchema),
  maintenanceController.create
);
router.put(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  maintenanceController.update
);
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  maintenanceController.remove
);

export default router;
