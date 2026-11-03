import { Router } from 'express';
import {
  getMeasurements,
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from '../controllers/measurementController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getMeasurements);
router.post('/', addMeasurement);
router.patch('/:id', updateMeasurement);
router.delete('/:id', deleteMeasurement);

export default router;
