import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ user_id: '', title: '', content: '' });
 
  useEffect(() => { 
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, postsRes] = await Promise.all([
        axios.get(`${API_URL}/api/users`),
        axios.get(`${API_URL}/api/posts`)
      ]);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to connect to backend. Make sure backend is running on ' + API_URL);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/posts`, {
        user_id: parseInt(newPost.user_id),
        title: newPost.title,
        content: newPost.content
      });
      setNewPost({ user_id: '', title: '', content: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <header>
        <h1>Social Demo App</h1>
        <p>React + Express.js + MySQL</p>
      </header>

      <div className="content">
        <section className="users-section">
          <h2>Users ({users.length})</h2>
          <div className="users-list">
            {users.map(user => (
              <div key={user.id} className="user-card">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="posts-section">
          <h2>Posts ({posts.length})</h2>
          
          <div className="new-post-form">
            <h3>Create a New Post</h3>
            <form onSubmit={handleSubmit}>
              <select
                value={newPost.user_id}
                onChange={(e) => setNewPost({ ...newPost, user_id: e.target.value })}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Post Title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Post Content"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                required
              />
              <button type="submit">Create Post</button>
            </form>
          </div>

          <div className="posts-list">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <h3>{post.title}</h3>
                  <span className="author">by {post.user_name || 'Unknown'}</span>
                </div>
                <p>{post.content}</p>
                <small>{new Date(post.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
