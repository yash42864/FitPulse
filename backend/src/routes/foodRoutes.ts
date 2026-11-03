import { Router } from 'express';
import { getFoods, createFood } from '../controllers/foodController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Allow public search, but authenticate for custom food additions
router.get('/', getFoods);
router.post('/', authenticate, createFood);

export default router;
