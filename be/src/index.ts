import express from 'express';
import cors from 'cors';
import pool from './config/database';

const app = express();
const PORT = process.env.PORT || 3002;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3003";

app.use(cors({
  origin: [CORS_ORIGIN],
  credentials: true,
}));

app.use(express.json());

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
app.post('/api/posts', async (req, res) => {
  try {
    const { user_id, title, content } = req.body;
    
    if (!user_id || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
