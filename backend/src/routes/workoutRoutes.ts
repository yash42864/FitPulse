import { Router } from 'express';
import {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getTemplates,
  createTemplate,
  deleteTemplate,
} from '../controllers/workoutController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getWorkouts);
router.post('/', createWorkout);
router.patch('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.delete('/templates/:id', deleteTemplate);

export default router;
