import { Router } from 'express';
import {
  getWaterLogs,
  addWaterLog,
  updateWaterLog,
  deleteWaterLog,
} from '../controllers/waterController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getWaterLogs);
router.post('/', addWaterLog);
router.patch('/:id', updateWaterLog);
router.delete('/:id', deleteWaterLog);

export default router;
