import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.put('/', ProfileController.updateProfile);
router.post('/certificates', ProfileController.addCertificate);
router.get('/certificates', ProfileController.getCertificates);

export default router;
