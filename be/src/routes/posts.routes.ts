import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createPostSchema, validateRequest } from '../validation';
import * as postService from '../services/post.service';

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
    const rows = await postService.getPosts();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.post('/', postLimiter, validateRequest(createPostSchema), async (req, res) => {
  try {
    const { user_id, title, content } = req.body;
    const { id } = await postService.createPost({ user_id, title, content });
    res.status(201).json({ message: 'Post created successfully', id });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

export default router;
