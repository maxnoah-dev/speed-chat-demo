import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

export default router;
