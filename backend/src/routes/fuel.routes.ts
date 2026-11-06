import { Router } from 'express';
import * as fuelController from '../controllers/fuel.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createFuelSchema } from '../validators/common.validator';

const router = Router();

router.use(authenticate);

router.get('/', fuelController.list);
router.get('/summary', fuelController.summary);
router.post(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'ACCOUNTANT'),
  validate(createFuelSchema),
  fuelController.create
);
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  fuelController.remove
);

export default router;
