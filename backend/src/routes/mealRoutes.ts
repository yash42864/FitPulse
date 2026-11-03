import { Router } from 'express';
import { getMeals, createMeal, updateMeal, deleteMeal } from '../controllers/mealController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getMeals);
router.post('/', createMeal);
router.patch('/:id', updateMeal);
router.delete('/:id', deleteMeal);

export default router;
