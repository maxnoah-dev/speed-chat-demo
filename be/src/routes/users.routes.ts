import { Router } from 'express';
import * as userService from '../services/user.service';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const rows = await userService.getUsers();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
