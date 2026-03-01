import { Router } from 'express';
import healthRoutes from './health.routes';
import uploadRoutes from './upload.routes';
import chatRoutes from './chat.routes';
const router = Router();

router.use('/health', healthRoutes);
router.use('/upload', uploadRoutes);
router.use('/chat', chatRoutes);

export default router;
