import { Router } from 'express';
import * as alertController from '../controllers/alert.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', alertController.list);
router.patch('/:id/read', alertController.markRead);
router.post('/read-all', alertController.markAllRead);
router.post(
  '/generate',
  authorize('ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'),
  alertController.generate
);

export default router;
