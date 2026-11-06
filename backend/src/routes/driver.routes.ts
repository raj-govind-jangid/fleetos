import { Router } from 'express';
import * as driverController from '../controllers/driver.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createDriverSchema, updateDriverSchema } from '../validators/driver.validator';

const router = Router();

router.use(authenticate);

router.get('/', driverController.list);
router.get('/:id', driverController.getById);
router.post(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  validate(createDriverSchema),
  driverController.create
);
router.put(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  validate(updateDriverSchema),
  driverController.update
);
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  driverController.remove
);

export default router;
