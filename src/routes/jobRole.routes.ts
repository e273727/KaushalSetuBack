import { Router } from 'express';
import { JobRoleController } from '../controllers/jobRole.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', JobRoleController.getJobRoles);
router.get('/:id/competencies', JobRoleController.getJobRoleCompetencies);
router.post('/', authenticate, authorizeRoles('admin'), JobRoleController.createJobRole);

export default router;
