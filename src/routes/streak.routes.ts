import { Router } from 'express';
import { StreakController } from '../controllers/streak.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, StreakController.getStreak);

export default router;
