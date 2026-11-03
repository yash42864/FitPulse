import { Router } from 'express';
import {
  getDashboard,
  getStepsAnalytics,
  getNutritionAnalytics,
  getWorkoutAnalytics,
  getSleepAnalytics,
  getCalorieBalanceAnalytics,
  getMonthlyProgress,
  getConsistencyScore,
  getLeaderboard,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/steps', getStepsAnalytics);
router.get('/nutrition', getNutritionAnalytics);
router.get('/workouts', getWorkoutAnalytics);
router.get('/sleep', getSleepAnalytics);
router.get('/calorie-balance', getCalorieBalanceAnalytics);
router.get('/progress', getMonthlyProgress);
router.get('/consistency', getConsistencyScore);
router.get('/leaderboard', getLeaderboard);

export default router;
