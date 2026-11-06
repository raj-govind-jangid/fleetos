import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createExpenseSchema } from '../validators/common.validator';

const router = Router();

router.use(authenticate);

router.get('/', expenseController.list);
router.post(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'ACCOUNTANT'),
  validate(createExpenseSchema),
  expenseController.create
);
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'ACCOUNTANT'),
  expenseController.remove
);

export default router;
