import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createVehicleSchema,
  updateVehicleSchema,
  assignDriverSchema,
} from '../validators/vehicle.validator';

const router = Router();

router.use(authenticate);

router.get('/', vehicleController.list);
router.get('/:id', vehicleController.getById);
router.post(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  validate(createVehicleSchema),
  vehicleController.create
);
router.put(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  validate(updateVehicleSchema),
  vehicleController.update
);
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  vehicleController.remove
);
router.patch(
  '/:id/assign-driver',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  validate(assignDriverSchema),
  vehicleController.assignDriver
);

export default router;
