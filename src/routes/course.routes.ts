import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', CourseController.getCourses);
router.get('/:id', CourseController.getCourseById);
router.post('/', authenticate, authorizeRoles('admin'), CourseController.createCourse);

export default router;
