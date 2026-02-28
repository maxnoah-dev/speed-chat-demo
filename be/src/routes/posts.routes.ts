import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import pool from '../config/database';
import { createPostSchema, validateRequest } from '../validation';

const router = Router();
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests to create posts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT p.*, u.name as user_name, u.email as user_email FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.post('/', postLimiter, validateRequest(createPostSchema), async (req, res) => {
  try {
    const { user_id, title, content } = req.body;
    const [result]: any = await pool.execute(
      'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
      [user_id, title, content]
    );
    res.status(201).json({ message: 'Post created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

export default router;
