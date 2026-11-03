import { Router } from 'express';
import {
  getSleepLogs,
  createSleepLog,
  updateSleepLog,
  deleteSleepLog,
} from '../controllers/sleepController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getSleepLogs);
router.post('/', createSleepLog);
router.patch('/:id', updateSleepLog);
router.delete('/:id', deleteSleepLog);

export default router;
