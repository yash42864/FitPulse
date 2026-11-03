import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import activityRoutes from './activityRoutes.js';
import foodRoutes from './foodRoutes.js';
import mealRoutes from './mealRoutes.js';
import workoutRoutes from './workoutRoutes.js';
import sleepRoutes from './sleepRoutes.js';
import waterRoutes from './waterRoutes.js';
import measurementRoutes from './measurementRoutes.js';
import goalRoutes from './goalRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/activity', activityRoutes);
router.use('/foods', foodRoutes);
router.use('/meals', mealRoutes);
router.use('/workouts', workoutRoutes);
router.use('/sleep', sleepRoutes);
router.use('/water', waterRoutes);
router.use('/measurements', measurementRoutes);
router.use('/goals', goalRoutes);
router.use('/analytics', analyticsRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FitPulse API',
  });
});

export default router;
