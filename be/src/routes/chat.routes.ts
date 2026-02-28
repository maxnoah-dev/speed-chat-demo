import { Router } from 'express';
import { generateRoomCode } from '../services/room.service';

const router = Router();

/** Generate a new unique room code for "Tạo phòng mới" */
router.get('/generate-code', (_req, res) => {
  res.json({ code: generateRoomCode() });
});

export default router;
