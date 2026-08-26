import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', AssessmentController.startAssessment);
router.post('/generate-ai-quiz', AssessmentController.generateAIQuiz);
router.post('/:id/answers', AssessmentController.submitAnswer);
router.post('/:id/complete', AssessmentController.completeAssessment);
router.get('/history', AssessmentController.getHistory);

export default router;
