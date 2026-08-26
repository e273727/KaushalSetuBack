import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmap.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', RoadmapController.getActiveRoadmap);
router.post('/generate', RoadmapController.generateRoadmap);
router.post('/recalculate', RoadmapController.recalculateRoadmap);
router.post('/rebuild-streak-backlog', RoadmapController.rebuildStreakBacklog);

export default router;
