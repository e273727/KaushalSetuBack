import { Router } from 'express';
import { CompetencyController } from '../controllers/competency.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', CompetencyController.getAllCompetencies);
router.get('/me', authenticate, CompetencyController.getUserCompetencies);
router.get('/me/skill-gaps', authenticate, CompetencyController.getUserSkillGaps);
router.post('/', authenticate, authorizeRoles('admin'), CompetencyController.createCompetency);

export default router;
