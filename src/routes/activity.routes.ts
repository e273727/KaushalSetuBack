import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/start', ActivityController.startActivity);
router.post('/:id/complete', ActivityController.completeActivity);
router.get('/history', ActivityController.getHistory);

export default router;
