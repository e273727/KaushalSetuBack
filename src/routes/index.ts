import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import jobRoleRoutes from './jobRole.routes';
import competencyRoutes from './competency.routes';
import assessmentRoutes from './assessment.routes';
import courseRoutes from './course.routes';
import recommendationRoutes from './recommendation.routes';
import roadmapRoutes from './roadmap.routes';
import activityRoutes from './activity.routes';
import streakRoutes from './streak.routes';
import documentRoutes from './document.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/job-roles', jobRoleRoutes);
router.use('/competencies', competencyRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/courses', courseRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/learning', activityRoutes);
router.use('/streak', streakRoutes);
router.use('/documents', documentRoutes);

export default router;
