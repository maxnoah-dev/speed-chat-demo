import { Router } from 'express';
import healthRoutes from './health.routes';
import usersRoutes from './users.routes';
import postsRoutes from './posts.routes';
import uploadRoutes from './upload.routes';
import chatRoutes from './chat.routes';
const router = Router();

router.use('/health', healthRoutes);
router.use('/users', usersRoutes);
router.use('/posts', postsRoutes);
router.use('/upload', uploadRoutes);
router.use('/chat', chatRoutes);

export default router;
