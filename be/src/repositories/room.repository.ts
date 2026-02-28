import pool from '../config/database';
import { ChatRoom } from '../types/chat';

const TABLE = 'chat_rooms';

export async function findRoomByCode(code: string): Promise<ChatRoom | null> {
  const [rows]: any = await pool.execute(
    `SELECT id, code, name, created_at FROM ${TABLE} WHERE code = ?`,
    [code]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function createRoom(code: string, name: string): Promise<number> {
  const [result]: any = await pool.execute(
    `INSERT INTO ${TABLE} (code, name) VALUES (?, ?)`,
    [code, name]
  );
  return result.insertId;
}

export async function getOrCreateRoomId(code: string, name?: string): Promise<number> {
  const existing = await findRoomByCode(code);
  if (existing) return existing.id;
  return createRoom(code, name || code);
}
