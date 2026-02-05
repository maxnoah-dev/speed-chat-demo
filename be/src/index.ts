import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pool from './config/database';
import { createPostSchema, validateRequest } from './validation';

const app = express();
const PORT = process.env.PORT || 3002;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '';

// Security middleware - Helmet
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [CORS_ORIGIN],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parser with size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Rate limiting middleware
// General rate limit: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for POST requests: 10 requests per 15 minutes
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests to create posts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limit to all requests
app.use(limiter);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
  });
  next();
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
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

// Create a new post
app.post('/api/posts', postLimiter, validateRequest(createPostSchema), async (req, res) => {
  try {
    const { user_id, title, content } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
      [user_id, title, content]
    );

    res.status(201).json({ message: 'Post created successfully', id: (result as any).insertId });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://188.166.234.37:${PORT}`);
});
