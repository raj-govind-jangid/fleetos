import { Router } from 'express';
import * as tripController from '../controllers/trip.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createTripSchema, updateTripSchema } from '../validators/trip.validator';

const router = Router();

router.use(authenticate);

router.get('/', tripController.list);
router.get('/:id', tripController.getById);
router.post(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  validate(createTripSchema),
  tripController.create
);
router.put(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  validate(updateTripSchema),
  tripController.update
);
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  tripController.remove
);

export default router;
