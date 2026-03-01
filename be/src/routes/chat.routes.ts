import { Router } from 'express';
import { generateRoomCode } from '../services/room.service';

const router = Router();

/** Generate a new unique room code for "Tạo phòng mới" */
router.get('/generate-code', (_req, res) => {
  try {
    const code = generateRoomCode();
    if (!code || typeof code !== 'string') {
      return res.status(500).json({ error: 'Failed to generate room code' });
    }
    return res.json({ code });
  } catch (e) {
    console.error('[chat] generate-code error:', e);
    return res.status(500).json({ error: 'Không thể tạo mã phòng' });
  }
});

export default router;
