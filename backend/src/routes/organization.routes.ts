import { Router } from 'express';
import * as organizationController from '../controllers/organization.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateOrganizationSchema, createUserSchema } from '../validators/common.validator';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

router.get('/', organizationController.getOrganization);
router.put(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN'),
  validate(updateOrganizationSchema),
  organizationController.updateOrganization
);
router.get('/users', authorize('ADMIN', 'SUPER_ADMIN'), organizationController.listUsers);
router.post(
  '/users',
  authorize('ADMIN', 'SUPER_ADMIN'),
  validate(createUserSchema),
  organizationController.createUser
);
router.patch(
  '/users/:id/status',
  authorize('ADMIN', 'SUPER_ADMIN'),
  validate(z.object({ status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']) })),
  organizationController.updateUserStatus
);

export default router;
