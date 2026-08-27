import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', DocumentController.uploadDocument);
router.get('/', DocumentController.getDocuments);
router.post('/chat', DocumentController.chatWithVectorContext);
router.delete('/:id', DocumentController.deleteDocument);

export default router;
