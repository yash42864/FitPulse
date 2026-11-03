import { Router } from 'express';
import {
  getActivityLogs,
  createOrUpdateActivityLog,
  deleteActivityLog,
} from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getActivityLogs);
router.post('/', createOrUpdateActivityLog);
router.patch('/:id', createOrUpdateActivityLog);
router.delete('/:id', deleteActivityLog);

export default router;
