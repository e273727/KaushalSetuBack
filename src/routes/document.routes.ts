import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', DocumentController.uploadDocument);
router.get('/', DocumentController.getDocuments);

export default router;
