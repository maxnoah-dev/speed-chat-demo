import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: (process.env.DB_HOST ?? '').trim(),
  user: (process.env.DB_USER ?? '').trim(),
  password: process.env.DB_PASSWORD,
  database: (process.env.DB_NAME ?? '').trim(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
